import { Component, signal } from '@angular/core';
import { TrackView } from "./pages/track-view/track-view";
import { SceneView } from './pages/scene-view/scene-view';
import { DiscordStatusDTO } from './api';
import { Sidebar } from "./components/sidebar/sidebar";
import { CampaignView } from './pages/campaign-view/campaign-view';
import { PropertyView } from "./pages/property-view/property-view";
import { TagView } from "./pages/tag-view/tag-view";

export type TabTypes = 'tracks' | 'scenes' | 'campaigns' | 'properties' | 'tags';

@Component({
  selector: 'app-root',
  imports: [TrackView, SceneView, CampaignView, Sidebar, PropertyView, TagView],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('wit-gui');

  discordInfo: DiscordStatusDTO = {};

  activeTab: TabTypes = 'tracks';

  setTab(tab: TabTypes) {
    this.activeTab = tab;
  }
}
