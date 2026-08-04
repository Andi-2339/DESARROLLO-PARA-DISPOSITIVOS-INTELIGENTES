import { Injectable, signal, computed } from '@angular/core';

export interface SeasonalTheme {
  name: string;
  cssClass: string;
  bannerText: string;
  bannerIcon: string;
  bannerImage: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeasonalThemeService {
  
  currentTheme = signal<SeasonalTheme>({
    name: 'Default',
    cssClass: 'theme-default',
    bannerText: '⚡ ANIME NEWS — Tu portal al universo del anime y manga',
    bannerIcon: '⚡',
    bannerImage: 'assets/cerezo.jpg'
  });

  /** Detecta el tema basado en la fecha actual */
  private detectTheme(): SeasonalTheme {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed: 0=Ene, 11=Dic
    const day = now.getDate();

    // Halloween: Octubre
    if (month === 9) {
      return {
        name: 'Halloween',
        cssClass: 'theme-halloween',
        bannerText: '🎃 ¡Especial Halloween! Descubre los animes de terror más escalofriantes',
        bannerIcon: '🎃',
        bannerImage: 'assets/halloween.jpg'
      };
    }

    // Navidad: Diciembre
    if (month === 11) {
      return {
        name: 'Navidad',
        cssClass: 'theme-christmas',
        bannerText: '🎄 ¡Feliz Navidad Otaku! Los mejores especiales navideños de anime',
        bannerIcon: '🎄',
        bannerImage: 'assets/christmas.jpg'
      };
    }

    // Año Nuevo: Enero 1-15
    if (month === 0 && day <= 15) {
      return {
        name: 'Año Nuevo',
        cssClass: 'theme-newyear',
        bannerText: '🎆 ¡Feliz Año Nuevo! Prepárate para los estrenos de temporada',
        bannerIcon: '🎆',
        bannerImage: 'assets/newyear.jpg'
      };
    }

    // San Valentín: Febrero 1-14
    if (month === 1 && day <= 14) {
      return {
        name: 'San Valentín',
        cssClass: 'theme-valentine',
        bannerText: '💖 Especial San Valentín: Los mejores romances del anime',
        bannerIcon: '💖',
        bannerImage: 'assets/valentine.jpg'
      };
    }

    // Verano: Junio-Agosto
    if (month >= 5 && month <= 7) {
      return {
        name: 'Verano',
        cssClass: 'theme-summer',
        bannerText: '☀️ ¡Temporada de Verano! Los animes más calientes del momento',
        bannerIcon: '☀️',
        bannerImage: 'assets/summer.jpg'
      };
    }

    // Primavera: Marzo-Mayo
    if (month >= 2 && month <= 4) {
      return {
        name: 'Primavera',
        cssClass: 'theme-spring',
        bannerText: '🌸 Temporada de Primavera — Nuevos estrenos florecen',
        bannerIcon: '🌸',
        bannerImage: 'assets/spring.jpg' // Assuming flores.jpeg could be used if renamed, but let's use a standard name
      };
    }

    // Otoño: Septiembre, Noviembre
    if (month === 8 || month === 10) {
      return {
        name: 'Otoño',
        cssClass: 'theme-autumn',
        bannerText: '🍂 Temporada de Otoño — Las hojas caen, los estrenos suben',
        bannerIcon: '🍂',
        bannerImage: 'assets/autumn.jpg'
      };
    }

    // Default
    return {
      name: 'Default',
      cssClass: 'theme-default',
      bannerText: '⚡ ANIME NEWS — Tu portal al universo del anime y manga',
      bannerIcon: '⚡',
      bannerImage: 'assets/cerezo.jpg'
    };
  }

  /** Aplica la clase del tema al body */
  applyTheme() {
    const theme = this.currentTheme();
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.body.classList.add(theme.cssClass);
  }

  /** Fuerza un tema específico (para preview/testing) */
  forceTheme(themeName: string) {
    const themes: Record<string, () => SeasonalTheme> = {
      halloween: () => ({ name: 'Halloween', cssClass: 'theme-halloween', bannerText: '🎃 ¡Especial Halloween!', bannerIcon: '🎃', bannerImage: 'assets/halloween.jpg' }),
      christmas: () => ({ name: 'Navidad', cssClass: 'theme-christmas', bannerText: '🎄 ¡Feliz Navidad!', bannerIcon: '🎄', bannerImage: 'assets/christmas.jpg' }),
      summer: () => ({ name: 'Verano', cssClass: 'theme-summer', bannerText: '☀️ ¡Temporada de Verano!', bannerIcon: '☀️', bannerImage: 'assets/summer.jpg' }),
      default: () => this.detectTheme()
    };
    const factory = themes[themeName] || themes['default'];
    this.currentTheme.set(factory());
    this.applyTheme();
  }
}
