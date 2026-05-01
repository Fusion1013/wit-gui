import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, ElementRef, inject, input, OnInit, output, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Track } from "../../api/model/track";
import { AudioControllerService, TrackControllerService } from "../../api";

@Component({
    selector: 'wit-track-row',
    imports: [CommonModule, FormsModule],
    templateUrl: './track-row.html',
    styleUrl: './track-row.scss'
})
export class TrackRow {

    @ViewChild('titleInput') titleInputField!: ElementRef;

    track = input<Track>();
    trackUpdatedEvent = output<any>();

    private readonly trackService = inject(TrackControllerService);
    private readonly audioService = inject(AudioControllerService);
    private readonly cd = inject(ChangeDetectorRef);

    editingTrack: boolean = false;
    editBuffer: any = {};

    startEdit(track: any) {
        this.editingTrack = true;

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
    if (!this.editingTrack) return;

    this.editBuffer.tags = typeof this.editBuffer.tags === 'string'
      ? this.editBuffer.tags.split(',').map((t: string) => t.trim())
      : this.editBuffer.tags;

    const id: any = this.track()?.id;

    this.trackService.updateTrack(id, this.editBuffer)
      .subscribe(() => {
        this.cancelEdit();
        this.trackUpdatedEvent.emit(this.track);
      });
  }

  cancelEdit() {
    this.editingTrack = false;
    this.editBuffer = {};
  }

  deleteTrack(id: any) {
    this.trackService.deleteTrack(id).subscribe(() => {
      this.trackUpdatedEvent.emit(this.track);
    });
  }

    playTrack(id: any) {
        console.log('Play track ' + id);
        this.audioService.playTrack(id).subscribe();
    }

    get title() {
        return this.track()?.title;
    }

    get artist() {
        return this.track()?.artist;
    }

    get link() {
        return this.track()?.youtube?.link;
    }

    get lengthMilliseconds() {
        return this.track()?.youtube?.lengthMilliseconds;
    }

    get tags() {
        return this.track()?.tags;
    }

}