import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../services/favorites.service';
import { ItemsService, Item } from '../items/services/items';
import { Observable, of, switchMap } from 'rxjs';
import { ItemCardComponent } from '../item-card/item-card';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, ItemCardComponent],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class FavoritesComponent implements OnInit {

  favoriteItems$: Observable<Item[]> = of([]);
  mergeInfo$: Observable<any> = of(null);

  constructor(
    private favoritesService: FavoritesService,
    private itemsService: ItemsService
  ) {}

  ngOnInit() {

    this.mergeInfo$ = this.favoritesService.mergeInfo$;

    this.favoriteItems$ = this.favoritesService.favorites$.pipe(
      switchMap((ids) => {
        if (!ids.length) return of([] as Item[]);

        return this.itemsService.getItems().pipe(
          switchMap((res) =>
            of(res.products.filter((p) => ids.includes(p.id)))
          )
        );
      })
    );
  }
}
