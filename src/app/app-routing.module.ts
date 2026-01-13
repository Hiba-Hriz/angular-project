import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberComponent } from './member/member.component';
import { MemberFormComponent } from './member-form/member-form.component';
import { LoginComponent } from './login/login.component';
import { EvtComponent } from './evt/evt.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OutilComponent } from './outil/outil.component';
import { PublicationComponent } from './publication/publication.component';
import { MemberProfileComponent } from './member-profile/member-profile.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: 'create',
    pathMatch: 'full',
    component: MemberFormComponent
  },
  {
    path: 'member',
    pathMatch: 'full',
    component: MemberComponent

  },
  {
    path: 'home',
    pathMatch: 'full',
    component: HomeComponent
  },
  {
    path: 'memberProfile',
    pathMatch: 'full',
    component: MemberProfileComponent
  }
  ,
  {
    path: 'events',
    pathMatch: 'full',
    component: EvtComponent

  },
  {
    path: 'tools',
    pathMatch: 'full',
    component: OutilComponent

  },
  {
    path: 'articles',
    pathMatch: 'full',
    component: PublicationComponent

  },
  {
    path: ':id/edit',
    pathMatch: 'full',
    component: MemberFormComponent

  },
  {
    path: 'dashboard',
    pathMatch: 'full',
    component: DashboardComponent
  },
  {
    path: 'login',
    pathMatch: 'full',
    component: LoginComponent

  },
  {
    path: '**',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
