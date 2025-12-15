import { RouterModule, Routes } from '@angular/router';
import { RoutesTo } from './utilities/routes';
import { NgModule } from '@angular/core';
import { App } from './app';
import { ControllerComponent } from './controller-component/controller-component';
import { GameComponent } from './game-component/game-component';

export const routes: Routes = [
    { path: RoutesTo.mainRoute, component: GameComponent},
    { path: RoutesTo.controllerRoute, component: ControllerComponent},
    { path: '**', component: GameComponent, pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }