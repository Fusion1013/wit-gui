import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioApiService, TagEntity, TrackApiService, TrackEntity } from '../../api';
import { TrackRow } from "./track-row/track-row";
import { Track } from '../../api/model/track';
import { TagMultiSelectComponent } from "../../components/tag-multi-select/tag-multi-select";
import { Subject } from 'rxjs';

@Component({
  selector: 'wit-track-view',
  imports: [CommonModule, FormsModule, TrackRow, TagMultiSelectComponent],
  templateUrl: './track-view.html',
  styleUrl: './track-view.scss',
})
export class TrackView implements OnInit {

  @ViewChild('titleInput') titleInputField!: ElementRef;

  tracks: TrackEntity[] = [];
  filteredTracks: TrackEntity[] = [];

  clearInputValues$ = new Subject<void>();

  searchTerm: string = "";

  newTrack: any = {
    title: '',
    artist: '',
    youtube: {
      link: '',
      lengthMilliseconds: 0
    },
    tags: []
  };

  editingTrackId: number = -1;

  private trackService = inject(TrackApiService);
  private audioService = inject(AudioApiService);
  private cd = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit() {
    this.loadTracks();
  }

  loadTracks(): void {
    this.trackService.getAllTracks().subscribe(data => {
      this.tracks = data;
      this.filteredTracks = data.sort((a, b) => {
        const titleA = a.title?.toLowerCase() ?? '';
        const titleB = b.title?.toLowerCase() ?? '';

        return titleA.localeCompare(titleB);
      });
      this.applyFilter();
      this.cd.detectChanges();
    });
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();

    this.filteredTracks = this.tracks.filter(track => {
      return (
        track.title?.toLowerCase().includes(term) ||
        track.artist?.toLowerCase().includes(term) ||
        track.youtube?.link?.toLowerCase().includes(term) ||
        (track.tags || []).some((tag: TagEntity) =>
          tag.name?.toLowerCase().includes(term)
        ) ||
        track.tags?.map(t => t.name).join(',').toLowerCase().includes(term)
      );
    });
  }

  playTrack(id: any) {
    console.log('Play track ' + id);
    this.audioService.playTrack(id).subscribe();
  }

  addTrack() {
    this.trackService.createTrack(this.newTrack).subscribe(() => {
      // reset form
      this.newTrack = {
        title: '',
        artist: '',
        youtube: {
          link: '',
          lengthMilliseconds: 0
        },
        tags: []
      };

      // reload table
      this.loadTracks();
      this.clearInputValues$.next();
    });
  }

  setTags(tags: TagEntity[]) {
    this.newTrack.tags = tags;
  }

}
