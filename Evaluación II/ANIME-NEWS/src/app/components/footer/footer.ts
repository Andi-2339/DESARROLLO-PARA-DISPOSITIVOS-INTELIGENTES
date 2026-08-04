import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
})
export class Footer {
  showPrivacyModal = false;

  togglePrivacy(event: Event) {
    event.preventDefault();
    this.showPrivacyModal = !this.showPrivacyModal;
  }

  openSocial(platform: string, event: Event) {
    event.preventDefault();
    const urls: Record<string, string> = {
      facebook: 'https://facebook.com/animenews',
      twitter: 'https://twitter.com/animenews',
      instagram: 'https://instagram.com/animenews',
      youtube: 'https://youtube.com/animenews'
    };
    window.open(urls[platform], '_blank');
  }
}
