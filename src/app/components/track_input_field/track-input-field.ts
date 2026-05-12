import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, input, OnInit, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TrackApiService, TrackEntity } from "../../api";
import { Track } from "../../api/model/track";
import { Subject } from "rxjs";

@Component({
    selector: 'wit-track-input-field',
    imports: [CommonModule, FormsModule],
    templateUrl: './track-input-field.html',
    styleUrl: './track-input-field.scss'
})
export class TrackInputField implements OnInit {
    
    tracks: any[] = [];

    trackInput: string = '';

    private trackService = inject(TrackApiService);
    private cd = inject(ChangeDetectorRef);

    clear$ = input<Subject<void>>();
    inputTrack = input<TrackEntity | undefined>();
    track = output<Track | undefined>();

    ngOnInit(): void {
        this.loadTracks();
        this.trackInput = this.inputTrack()?.title!;
        this.clear$()?.subscribe(() => {
            this.trackInput = '';
        });
    }

    loadTracks(): void {
        this.trackService.getAllTracks().subscribe(data => {
            this.tracks = data;
            this.cd.detectChanges();
        });
    }

    onChange(): void {
        const foundTrack = this.tracks.find(item => item.title === this.trackInput);
        this.track.emit(foundTrack);
    }

}