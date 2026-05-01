import { Component, signal } from '@angular/core';
import { TrackView } from "./track-view/track-view";
import { SceneView } from './scene-view/scene-view';
import { DiscordStatusDTO } from './api';
import { CampaignView } from "./campaign-view/campaign-view";
import { Sidebar } from "./components/sidebar/sidebar";

@Component({
  selector: 'app-root',
  imports: [TrackView, SceneView, CampaignView, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('wit-gui');

  discordInfo: DiscordStatusDTO = {};

  activeTab: 'tracks' | 'scenes' | 'campaigns' = 'tracks';

  setTab(tab: 'tracks' | 'scenes' | 'campaigns') {
    this.activeTab = tab;
  }
}
