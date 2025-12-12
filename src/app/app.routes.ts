import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { AboutUsComponent } from './about-us/about-us';
import { ItemsListComponent } from './items-list/items-list';
import { ItemDetailsComponent } from './item-details/item-details';
import { LoginComponent } from './login/login';
import { SignupComponent } from './signup/signup';
import { ProfileComponent } from './profile/profile';
import { FavoritesComponent } from './favorites/favorites';
import { authGuard } from './guards/auth.guard';
import {AppComponent} from './app';
import { OfflinePageComponent } from './offline-page/offline-page';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutUsComponent },
  { path: 'items', component: ItemsListComponent },
  { path: 'items/:id', component: ItemDetailsComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'offline', component: OfflinePageComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
