import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  tags: string[];
  typicalResult: string;
  bullets: string[];
  deliverables: string[];
  timeline: string;
  idealFor: string[];
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  isServiceModalOpen = signal(false);
  selectedService = signal<ServiceDetail | null>(null);

  openServiceModal(service: ServiceDetail) {
    this.selectedService.set(service);
    this.isServiceModalOpen.set(true);
  }

  closeServiceModal() {
    this.isServiceModalOpen.set(false);
    // Clear service after animation completes
    setTimeout(() => {
      this.selectedService.set(null);
    }, 300);
  }
}
