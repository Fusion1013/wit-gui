import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, ElementRef, inject, input, OnInit, output, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AudioControllerService, SceneControllerService, SceneEntity, TrackControllerService } from "../../api";

@Component({
    selector: 'wit-scene-row',
    imports: [CommonModule, FormsModule],
    templateUrl: './scene-row.html',
    styleUrl: './scene-row.scss'
})
export class SceneRow implements OnInit {

    private readonly sceneService = inject(SceneControllerService);
    private readonly trackService = inject(TrackControllerService);
    private audioService = inject(AudioControllerService);
    private readonly cd = inject(ChangeDetectorRef);

    tracks: any[] = [];
    scene = input<SceneEntity>();
    changeEvent = output<any>();

    isEditingScene: boolean = false;
    isExpanded: boolean = false;

    editBuffer: any = {};

    ngOnInit(): void {
        this.loadTracks();
    }

    private loadTracks(): void {
        this.trackService.getAllTracks().subscribe(data => {
            this.tracks = data;
            this.cd.detectChanges();
        });
    }

    startEdit(event: MouseEvent) {
        event.stopPropagation();
        this.isEditingScene = true;

        this.editBuffer = {
            ...this.scene(),
            introTrackId: this.scene()?.introTrack?.title ?? '',
            moodTags: [...(this.scene()?.moodTags || [])]
        }
    }

    saveEdit(event: MouseEvent) {
        event.stopPropagation();
        if (!this.isEditingScene) return;

        this.editBuffer.moodTags = typeof this.editBuffer.moodTags === 'string'
            ? this.editBuffer.moodTags.split(',').map((t: string) => t.trim())
            : this.editBuffer.moodTags;

        this.editBuffer.introTrackId = this.tracks.find(item => item.title === this.editBuffer.introTrackId)?.id;

        const id: any = this.scene()?.id;

        if (this.editBuffer.introTrackId != null) {
            this.trackService.getTrack(this.editBuffer.introTrackId).subscribe(track => { this.updateScene(id, track); })
        } else {
            this.updateScene(id, null);
        }
    }

    private updateScene(id: any, track: any) {
        this.sceneService.updateScene(id, {
            title: this.editBuffer.title,
            introTrack: track,
            moodTags: this.editBuffer.moodTags
        }).subscribe(() => {
            this.cancelEdit(undefined);
            this.changeEvent.emit(this.scene);
        });
    }

    cancelEdit(event: MouseEvent | undefined) {
        if (event) event.stopPropagation();
        this.isEditingScene = false;
        this.editBuffer = {};
    }

    deleteScene(id: any, event: MouseEvent) {
        event.stopPropagation();
        this.sceneService.deleteScene(id).subscribe(() => {
            this.changeEvent.emit(this.scene);
        });
    }

    playScene(id: any, event: MouseEvent) {
        event.stopPropagation();
        console.log('Play scene ' + id);
        this.audioService.playScene(id).subscribe();
    }

    toggleSceneMoreInfo() {
        this.isExpanded = !this.isExpanded;
    }

    preventPropagation(event: MouseEvent) {
        event.stopPropagation();
    }

    get tracksForScene() {
        if (this.scene() == null) return [];

        if (!this.scene()?.moodTags || this.scene()?.moodTags?.length === 0) {
            return [];
        }

        return this.tracks.filter(track =>
            this.scene()?.moodTags?.every((tag: string) =>
                track.tags?.includes(tag)
            )
        ).sort((a, b) => {
            const titleA = a.title?.toLowerCase() ?? '';
            const titleB = b.title?.toLowerCase() ?? '';

            return titleA.localeCompare(titleB);
        });
    }

    get moodTags() {
        return this.scene()?.moodTags;
    }

    get sceneId() {
        return this.scene()?.id;
    }

}