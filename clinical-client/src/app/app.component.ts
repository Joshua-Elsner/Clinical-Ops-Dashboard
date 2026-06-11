import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 30px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: auto; background: #f8f9fa; min-height: 100vh;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">🏥 Clinical Operations Command Center</h2>
      
      <div *ngIf="!lastAlert" style="text-align: center; padding: 40px; color: #6c757d; font-style: italic; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <p>System operational. Listening for Kafka telemetry streams...</p>
      </div>

      <div *ngIf="lastAlert" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
        
        <div style="background: white; border-top: 4px solid #dc3545; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="color: #dc3545; margin-top: 0; display: flex; align-items: center;">
            <span style="font-size: 1.5em; margin-right: 10px;">⚠️</span> Hardware Alert
          </h3>
          <div style="line-height: 1.6; color: #333;">
            <p><strong>Device Status:</strong> <span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.9em;">MAINTENANCE REQUIRED</span></p>
            <p><strong>Equipment:</strong> {{ lastAlert.deviceType }}</p>
            <p><strong>Encounter ID:</strong> <span style="font-family: monospace; color: #666;">{{ lastAlert.encounterId }}</span></p>
            <p><strong>Timestamp:</strong> {{ lastAlert.readingTimestamp | date:'medium' }}</p>
          </div>
        </div>

        <div style="background: white; border-top: 4px solid #0d6efd; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="color: #0d6efd; margin-top: 0; display: flex; align-items: center;">
            <span style="font-size: 1.5em; margin-right: 10px;">📊</span> Patient Analytics
          </h3>
          
          <div *ngIf="loadingRisk" style="color: #6c757d; font-style: italic;">
            Querying BigQuery data warehouse...
          </div>

          <div *ngIf="riskError" style="color: #dc3545;">
            {{ riskError }}
          </div>

          <div *ngIf="patientRisk && !loadingRisk" style="line-height: 1.6; color: #333;">
            <p><strong>Patient Link:</strong> <span style="font-family: monospace; color: #666;">{{ lastAlert.patientId }}</span></p>
            <p><strong>Age Demographics:</strong> {{ patientRisk.current_age }} years ({{ patientRisk.age_bracket }})</p>
            <p><strong>Primary Diagnosis:</strong> {{ patientRisk.primary_diagnosis_description }}</p>
            
            <div style="margin-top: 15px; padding: 10px; border-radius: 6px;" 
                 [ngStyle]="{'background': patientRisk.is_30_day_readmission ? '#fff3cd' : '#d1e7dd', 
                             'border': patientRisk.is_30_day_readmission ? '1px solid #ffe69c' : '1px solid #a3cfbb',
                             'color': patientRisk.is_30_day_readmission ? '#856404' : '#0f5132'}">
              <strong>30-Day Readmission Risk: </strong>
              <span>{{ patientRisk.is_30_day_readmission ? 'ELEVATED (Flagged via Synthea Model)' : 'LOW / NOMINAL' }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  private socket = io('http://localhost:4000');
  
  lastAlert: any = null;
  patientRisk: any = null;
  loadingRisk: boolean = false;
  riskError: string = '';

  // Inject the newly provided HttpClient
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.socket.on('device_alert', (data) => {
      console.log('Real-time alert received via WebSocket!', data);
      this.lastAlert = data;
      
      // Reset analytical state
      this.patientRisk = null;
      this.riskError = '';
      this.loadingRisk = true;

      // Trigger the Cold Path proxy lookup immediately
      this.fetchPatientRisk(data.patientId);
    });
  }

  fetchPatientRisk(patientId: string) {
    this.http.get<any>(`http://localhost:4000/api/patient/${patientId}/risk`).subscribe({
      next: (response) => {
        if (response.success) {
          this.patientRisk = response.data;
        } else {
          this.riskError = response.message || 'Risk profile not found.';
        }
        this.loadingRisk = false;
      },
      error: (err) => {
        console.error('Failed to fetch from BigQuery proxy:', err);
        this.riskError = 'Failed to connect to enterprise data warehouse.';
        this.loadingRisk = false;
      }
    });
  }
}