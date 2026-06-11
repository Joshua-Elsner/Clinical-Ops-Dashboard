import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2>Telemetry Command Center</h2>
      
      <div *ngIf="lastAlert" style="background: #ffebee; border: 2px solid #f44336; padding: 15px; border-radius: 8px;">
        <h3 style="color: #d32f2f; margin-top: 0;">⚠️ CRITICAL MAINTENANCE ALERT</h3>
        <p><strong>Device:</strong> {{ lastAlert.deviceType }}</p>
        <p><strong>Patient ID:</strong> {{ lastAlert.patientId }}</p>
        <p><strong>Timestamp:</strong> {{ lastAlert.readingTimestamp }}</p>
      </div>

      <p *ngIf="!lastAlert" style="color: #666; font-style: italic;">
        Listening for Kafka telemetry events...
      </p>
    </div>
  `
})
export class AppComponent implements OnInit {
  private socket = io('http://localhost:4000');
  lastAlert: any = null;

  ngOnInit() {
    // Listen for the specific event name emitted from Node
    this.socket.on('device_alert', (data) => {
      console.log('Real-time alert received via WebSocket!', data);
      this.lastAlert = data;
    });
  }
}