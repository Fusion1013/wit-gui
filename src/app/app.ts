import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TrackView } from "./track-view/track-view";
import { SceneView } from './scene-view/scene-view';
import { DiscordInfoControllerService, DiscordStatusDTO } from './api';
import { interval, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [TrackView, SceneView],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('wit-gui');

  private discordService = inject(DiscordInfoControllerService);
  private cd = inject(ChangeDetectorRef);

  discordInfo: DiscordStatusDTO = {};

  activeTab: 'tracks' | 'scenes' = 'tracks';

  ngOnInit(): void {
    this.update();
  }

  private update() {
    interval(3000)
      .pipe(
        switchMap(() => this.discordService.getInfo())
      )
      .subscribe(data => {
        this.discordInfo = data;
        this.cd.detectChanges();
      });
  }

  setTab(tab: 'tracks' | 'scenes') {
    this.activeTab = tab;
  }
}
