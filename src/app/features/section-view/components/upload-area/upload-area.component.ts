import { Component, output, signal } from '@angular/core';

type UploadState = 'idle' | 'success' | 'error-format' | 'error-network';

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv', 'image/jpeg'];
const ACCEPTED_EXTENSIONS = ['.pdf', '.xls', '.xlsx', '.csv', '.jpg', '.jpeg'];

@Component({
  selector: 'app-upload-area',
  standalone: true,
  templateUrl: './upload-area.component.html'
})
export class UploadAreaComponent {
  fileUploaded = output<File>();
  cleared = output<void>();

  state = signal<UploadState>('idle');
  isDragOver = signal(false);

  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragOver.set(true); }
  onDragLeave(): void { this.isDragOver.set(false); }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.handleFile(file);
  }

  private handleFile(file: File): void {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(ext)) {
      this.state.set('error-format');
      return;
    }
    // Simulate upload (real HTTP call in future task)
    this.state.set('success');
    this.fileUploaded.emit(file);
  }

  clear(): void {
    this.state.set('idle');
    this.cleared.emit();
  }
}
