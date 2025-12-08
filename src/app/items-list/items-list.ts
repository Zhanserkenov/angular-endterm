import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemCardComponent } from '../item-card/item-card';

import { Subscription, Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as ItemsActions from '../items/state/items.actions';
import {
  selectItemsList,
  selectListLoading,
  selectListError,
  selectTotal,
  selectPageSize
} from '../items/state/items.selectors';
import { Item } from '../items/services/items';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ItemCardComponent],
  templateUrl: './items-list.html',
  styleUrls: ['./items-list.css']
})
export class ItemsListComponent implements OnInit, OnDestroy {
  items$!: Observable<Item[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  total$!: Observable<number>;

  searchQuery = '';
  page = 1;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 20];
  private searchSubject = new Subject<string>();
  private subscriptions = new Subscription();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.items$ = this.store.select(selectItemsList);
    this.loading$ = this.store.select(selectListLoading);
    this.error$ = this.store.select(selectListError);
    this.total$ = this.store.select(selectTotal);

    const params = this.route.snapshot.queryParams;
    this.searchQuery = params['q'] || '';
    this.page = Number(params['page']) || 1;
    this.pageSize = Number(params['pageSize']) || this.pageSize;

    this.loadItems();

    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        const urlQuery = params['q'] || '';
        const urlPage = Number(params['page']) || 1;
        const urlPageSize = Number(params['pageSize']) || this.pageSize;

        if (
          urlQuery !== this.searchQuery ||
          urlPage !== this.page ||
          urlPageSize !== this.pageSize
        ) {
          this.searchQuery = urlQuery;
          this.page = urlPage;
          this.pageSize = urlPageSize;
          this.loadItems();
        }
      })
    );

    const searchSub = this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(query => {
        if (query) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { q: query, page: 1 },
            queryParamsHandling: 'merge'
          });
        } else {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { q: null, page: 1 },
            queryParamsHandling: 'merge'
          });
        }
      });

    this.subscriptions.add(searchSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  loadItems() {
    const query = this.searchQuery.trim() || undefined;
    const zeroBasedPage = this.page - 1;
    this.store.dispatch(
      ItemsActions.loadItems({ query, page: zeroBasedPage, pageSize: this.pageSize })
    );
  }

  onPageChange(newPage: number) {
    if (newPage < 1) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: newPage },
      queryParamsHandling: 'merge'
    });
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = Number(newPageSize) || this.pageSize;
    this.page = 1;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.page, pageSize: this.pageSize },
      queryParamsHandling: 'merge'
    });
  }

  getTotalPages(total: number | null | undefined): number {
    if (!total || total <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(total / this.pageSize));
  }
}
