import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { SignupComponent } from './pages/signup/signup';
import { HomeComponent } from './pages/home/home';
import { Noticias } from './pages/noticias/noticias';
import { Catalogo } from './pages/catalogo/catalogo';
import { Mangas } from './pages/mangas/mangas';
import { Temporadas } from './pages/temporadas/temporadas';
import { UserManagementComponent } from './pages/admin/user-management';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Public Gateway
  { path: '', component: LandingComponent },
  { path: 'signup', component: SignupComponent },
  
  // Smart TV 10-foot UI (Public, sin authGuard)
  { 
    path: 'tv', 
    loadComponent: () => import('./pages/tv/tv').then(m => m.TvComponent) 
  },

  // Protected Portal
  {
  path: '',
  canActivate: [authGuard],
  children: [
    {
      path: 'home',
      loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
    },
    {
      path: 'noticias',
      loadComponent: () => import('./pages/noticias/noticias').then(m => m.Noticias)
    },
    {
      path: 'catalogo',
      loadComponent: () => import('./pages/catalogo/catalogo').then(m => m.Catalogo)
    },
    {
      path: 'mangas',
      loadComponent: () => import('./pages/mangas/mangas').then(m => m.Mangas)
    },
    {
      path: 'temporadas',
      loadComponent: () => import('./pages/temporadas/temporadas').then(m => m.Temporadas)
    },
      {
        path: 'tareas',
        loadComponent: () => import('./pages/task-manager/task-manager').then(m => m.TaskManagerComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent)
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./pages/admin/user-management').then(m => m.UserManagementComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'admin/moderation',
        loadComponent: () => import('./pages/admin/moderation').then(m => m.ModerationComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'admin/audit',
        loadComponent: () => import('./pages/admin/audit-log').then(m => m.AuditLogComponent),
        canActivate: [adminGuard]
      }
  ]
},
  
  { path: '**', redirectTo: '' }
];