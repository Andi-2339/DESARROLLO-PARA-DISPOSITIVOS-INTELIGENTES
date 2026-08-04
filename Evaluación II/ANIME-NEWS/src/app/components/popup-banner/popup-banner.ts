import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';

@Component({
  selector: 'app-popup-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- BANNER SUPERIOR ANIMADO -->
    @if (showBanner()) {
      <div class="promo-banner" [class]="themeService.currentTheme().cssClass">
        <div class="banner-content">
          <span class="banner-icon">{{ themeService.currentTheme().bannerIcon }}</span>
          <span class="banner-text">{{ themeService.currentTheme().bannerText }}</span>
          <button class="banner-close" (click)="closeBanner()">✕</button>
        </div>
      </div>
    }

    <!-- POPUP MODAL -->
    @if (showPopup()) {
      <div class="popup-overlay" (click)="closePopup()">
        <div class="popup-modal" (click)="$event.stopPropagation()">
          <button class="popup-close-btn" (click)="closePopup()">✕</button>
          <div class="popup-content">
            <div class="popup-icon-big">🔥</div>
            <h2>¡No te pierdas lo nuevo!</h2>
            <p>Los estrenos de la temporada están aquí. Revisa las últimas noticias y estrenos exclusivos.</p>
            <div class="popup-actions">
              <button class="btn-popup-primary" (click)="closePopup()">Ver Noticias</button>
              <button class="btn-popup-secondary" (click)="closePopup()">Más Tarde</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* BANNER SUPERIOR */
    .promo-banner {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 9999;
      padding: 10px 20px;
      background: linear-gradient(90deg, #0a0a0a, #1a0030, #0a0a0a);
      border-bottom: 2px solid var(--pink);
      animation: bannerSlideIn 0.5s ease-out;
    }

    .promo-banner.theme-halloween {
      background: linear-gradient(90deg, #1a0a00, #2d1400, #1a0a00);
      border-bottom-color: #ff6600;
    }

    .promo-banner.theme-christmas {
      background: linear-gradient(90deg, #0a1a00, #1a0000, #0a1a00);
      border-bottom-color: #ff0000;
    }

    .promo-banner.theme-summer {
      background: linear-gradient(90deg, #1a1a00, #2d2a00, #1a1a00);
      border-bottom-color: #ffcc00;
    }

    .banner-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .banner-icon { font-size: 1.3em; }

    .banner-text {
      color: #fff;
      font-size: 0.9em;
      font-weight: 500;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
      animation: bannerGlow 2s ease-in-out infinite alternate;
    }

    .banner-close {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #888;
      cursor: pointer;
      padding: 2px 8px;
      border-radius: 50%;
      font-size: 0.8em;
      transition: 0.3s;
      box-shadow: none;
    }

    .banner-close:hover {
      color: #fff;
      border-color: #fff;
      transform: none;
      box-shadow: none;
    }

    @keyframes bannerSlideIn {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes bannerGlow {
      from { text-shadow: 0 0 5px rgba(255, 255, 255, 0.2); }
      to { text-shadow: 0 0 15px rgba(0, 234, 255, 0.5); }
    }

    /* POPUP MODAL */
    .popup-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: overlayFadeIn 0.3s ease;
    }

    .popup-modal {
      position: relative;
      background: #0a0a0a;
      border: 2px solid var(--purple);
      border-radius: 20px;
      max-width: 500px;
      width: 90%;
      overflow: hidden;
      animation: popupScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 0 40px rgba(155, 77, 255, 0.3), 0 0 80px rgba(255, 46, 209, 0.15);
    }

    .popup-close-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      background: transparent;
      border: 1px solid #333;
      color: #666;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9em;
      transition: 0.3s;
      z-index: 2;
      box-shadow: none;
      padding: 0;
    }

    .popup-close-btn:hover {
      color: var(--pink);
      border-color: var(--pink);
      transform: none;
      box-shadow: none;
    }

    .popup-content {
      padding: 50px 40px;
      text-align: center;
    }

    .popup-icon-big {
      font-size: 3.5em;
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }

    .popup-content h2 {
      color: #fff;
      font-size: 1.8em;
      margin-bottom: 15px;
      text-shadow: 0 0 15px var(--blue);
      font-family: 'Orbitron', sans-serif;
    }

    .popup-content p {
      color: #aaa;
      font-size: 1em;
      line-height: 1.6;
      margin-bottom: 30px;
    }

    .popup-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-popup-primary {
      padding: 12px 30px;
      background: linear-gradient(45deg, var(--blue), var(--purple));
      color: #fff;
      border: none;
      border-radius: 25px;
      font-weight: bold;
      cursor: pointer;
      transition: 0.3s;
      font-size: 0.95em;
    }

    .btn-popup-primary:hover {
      transform: scale(1.05);
      box-shadow: 0 0 25px var(--blue);
    }

    .btn-popup-secondary {
      padding: 12px 30px;
      background: transparent;
      color: #888;
      border: 1px solid #333;
      border-radius: 25px;
      cursor: pointer;
      transition: 0.3s;
      font-size: 0.95em;
    }

    .btn-popup-secondary:hover {
      color: #fff;
      border-color: #666;
      transform: none;
      box-shadow: none;
    }

    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes popupScale {
      from { transform: scale(0.7); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `]
})
export class PopupBannerComponent implements OnInit, OnDestroy {
  themeService = inject(SeasonalThemeService);
  showBanner = signal(true);
  showPopup = signal(false);
  private popupTimer: any;

  ngOnInit() {
    // Mostrar popup después de 3 segundos si no se ha cerrado antes en esta sesión
    const dismissed = sessionStorage.getItem('popup_dismissed');
    if (!dismissed) {
      this.popupTimer = setTimeout(() => {
        this.showPopup.set(true);
      }, 3000);
    }
  }

  ngOnDestroy() {
    if (this.popupTimer) clearTimeout(this.popupTimer);
  }

  closeBanner() {
    this.showBanner.set(false);
  }

  closePopup() {
    this.showPopup.set(false);
    sessionStorage.setItem('popup_dismissed', 'true');
  }
}
