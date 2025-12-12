import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './about-us.html',
  styleUrls: ['./about-us.css']
})
export class AboutUsComponent {
  title = 'About Our Team';
  mission = 'We are a passionate team of developers and designers dedicated to creating exceptional online shopping experiences. Our mission is to bring you the best products from around the web, curated with care and attention to detail.';

  photoUrl = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop';

  teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'Lead Developer',
      bio: 'Full-stack developer with 8+ years of experience building scalable web applications.',
      icon: '💻'
    },
    {
      name: 'Sarah Chen',
      role: 'UI/UX Designer',
      bio: 'Creative designer passionate about creating intuitive and beautiful user interfaces.',
      icon: '🎨'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Product Manager',
      bio: 'Focused on delivering value to customers through data-driven product decisions.',
      icon: '📊'
    },
    {
      name: 'Emma Wilson',
      role: 'Quality Assurance',
      bio: 'Ensuring our platform works flawlessly across all devices and browsers.',
      icon: '🔍'
    }
  ];

  liked = false;

  email = '';
  subscribed = false;

  toggleLike(): void {
    this.liked = true;
  }

  subscribe(): void {
    if (this.email) {
      this.subscribed = true;
    }
  }
}
