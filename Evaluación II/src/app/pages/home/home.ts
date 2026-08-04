import { Component, OnInit, OnDestroy, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './home.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit, OnDestroy {

  themeService = inject(SeasonalThemeService);

  // TV Background based on selection
  tvBackgrounds: string[] = [
    'assets/DemonSlayer.jpg',
    'assets/JujutsuKaisen.jpg',
    'assets/Naruto.jpg',
    'assets/OnePiece.jpg'
  ];
  currentTvBackground: string | null = null;

  images: string[] = [
    'assets/flores.jpeg',
    'assets/DemonSlayer.jpg',
    'assets/JujutsuKaisen.jpg',
    'assets/Naruto.jpg',
    'assets/gato.jpg'
  ];

  currentIndex: number = 0;
  interval: any;

  // Highlight hover effect / D-pad focus
  highlightedCard = signal<number>(0); // Empieza en 0 para D-pad

  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  // Eventos de ratón
  onCardHover(index: number) {
    this.highlightedCard.set(index);
  }

  onCardLeave() {
    // Para D-Pad mantenemos el foco, no lo quitamos
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
        // Al dar OK cambia el fondo multimedia
        this.currentTvBackground = this.tvBackgrounds[index];
        break;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
}