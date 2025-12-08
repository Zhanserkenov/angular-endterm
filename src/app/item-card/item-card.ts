import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Item } from '../items/services/items';
import { FavoritesService } from '../services/favorites.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './item-card.html',
  styleUrls: ['./item-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemCardComponent implements OnInit {
  @Input() item!: Item;
  isFavorite$!: Observable<boolean>;

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit() {
    this.isFavorite$ = this.favoritesService.isFavorite(this.item.id);
  }

  toggleFavorite(event: MouseEvent) {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(this.item.id);
  }
}
