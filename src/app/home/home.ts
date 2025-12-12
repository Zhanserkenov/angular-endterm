import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ItemCardComponent } from '../item-card/item-card';
import * as ItemsActions from '../items/state/items.actions';
import { selectItemsList } from '../items/state/items.selectors';
import { Item } from '../items/services/items';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ItemCardComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  title = 'Welcome to Our Online Store';
  subtitle = 'Discover amazing products from smartphones to groceries. Everything you need, delivered with care.';
  heroImage = 'https://www.fmi.org/images/default-source/blog-images/enhanced-tech-grocery-store.jpg?sfvrsn=85674643_1';

  featuredItems$!: Observable<Item[]>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(ItemsActions.loadItems({ page: 0, pageSize: 12 }));
    this.featuredItems$ = this.store.select(selectItemsList);
  }
}
