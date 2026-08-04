import { Component, OnInit, OnDestroy, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TvSyncService } from '../../services/tv-sync.service';

@Component({
  selector: 'app-tv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tv.html',
  styleUrls: ['./tv.css']
})
export class TvComponent implements OnInit, OnDestroy {
  tvSyncService = inject(TvSyncService);
  
  // Datos TV Sync
  heartRate = signal<number>(0);
  hypeLevel = signal<number>(0);
  episodes = signal<number>(0);
  criticalAlert = signal<boolean>(false);
  
  // Grid and Content
  tvBackgrounds: string[] = [
    'assets/DemonSlayer.jpg',
    'assets/JujutsuKaisen.jpg',
    'assets/Naruto.jpg',
    'assets/logo.png' // One Piece missing, fallback to logo
  ];
  currentTvBackground = signal<string>('assets/DemonSlayer.jpg');
  
  // Highlight hover effect / D-pad focus
  highlightedCard = signal<number>(0);

  // Fecha y hora
  currentTime = signal<Date>(new Date());
  timerInterval: any;

  ngOnInit(): void {
    // Sincronizar tiempo
    this.timerInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);

    // Suscribirse a los datos de la app del teléfono a través del servicio
    this.tvSyncService.syncData$.subscribe(data => {
      if (data) {
        this.heartRate.set(data.heart_rate);
        this.hypeLevel.set(data.hype_level);
        this.episodes.set(data.episodes);
        this.criticalAlert.set(data.critical_alert);
      }
    });
  }

  // D-pad Navigation para Smart TV
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let index = this.highlightedCard();
    
    switch (event.key) {
      case 'ArrowRight':
        if (index === 0 || index === 2) this.highlightedCard.set(index + 1);
        break;
      case 'ArrowLeft':
        if (index === 1 || index === 3) this.highlightedCard.set(index - 1);
        break;
      case 'ArrowDown':
        if (index < 2) this.highlightedCard.set(index + 2);
        break;
      case 'ArrowUp':
        if (index >= 2) this.highlightedCard.set(index - 2);
        break;
      case 'Enter':
      case ' ':
        // Al dar OK cambia el fondo multimedia
        this.currentTvBackground.set(this.tvBackgrounds[index]);
        break;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}
