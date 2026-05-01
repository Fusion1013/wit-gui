import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioControllerService, TrackControllerService } from '../api';
import { TrackRow } from "./track-row/track-row";
import { Track } from '../api/model/track';

@Component({
  selector: 'wit-track-view',
  imports: [CommonModule, FormsModule, TrackRow],
  templateUrl: './track-view.html',
  styleUrl: './track-view.scss',
})
export class TrackView implements OnInit {

  @ViewChild('titleInput') titleInputField!: ElementRef;

  tracks: Track[] = [];
  filteredTracks: Track[] = [];

  searchTerm: string = "";

  tagsInput: string = '';
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

  editBuffer: any = {};

  private trackService = inject(TrackControllerService);
  private audioService = inject(AudioControllerService);
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
        (track.tags || []).some((tag: string) =>
          tag.toLowerCase().includes(term)
        ) ||
        track.tags?.join(',').toLowerCase().includes(term)
      );
    });
  }

  playTrack(id: any) {
    console.log('Play track ' + id);
    this.audioService.playTrack(id).subscribe();
  }

  addTrack() {
    // convert tags string → array
    this.newTrack.tags = this.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

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
      this.tagsInput = '';

      // reload table
      this.loadTracks();
    });
  }

  startEdit(track: any) {
    this.editingTrackId = track.id;

    this.editBuffer = {
      title: track.title ?? '',
      artist: track.artist ?? '',
      youtube: {
        link: track.youtube?.link ?? '',
        lengthMilliseconds: track.youtube?.lengthMilliseconds ?? 0
      },
      tags: [...(track.tags || [])]
    };

    // clone so we don't mutate original until save
    this.editBuffer = {
      ...track,
      youtube: { ...track.youtube },
      tags: [...(track.tags || [])]
    };

    this.titleInputField.nativeElement.focus();
  }

  saveEdit() {
    if (this.editingTrackId == -1) return;

    this.editBuffer.tags = typeof this.editBuffer.tags === 'string'
      ? this.editBuffer.tags.split(',').map((t: string) => t.trim())
      : this.editBuffer.tags;

    this.trackService.updateTrack(this.editingTrackId, this.editBuffer)
      .subscribe(() => {
        this.cancelEdit();
        this.loadTracks();
      });
  }

  cancelEdit() {
    this.editingTrackId = -1;
    this.editBuffer = {};
  }

  deleteTrack(id: any) {
    this.trackService.deleteTrack(id).subscribe(() => {
      this.loadTracks();
    });
  }

}
