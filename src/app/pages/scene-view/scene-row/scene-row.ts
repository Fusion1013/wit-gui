import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, ElementRef, inject, input, OnInit, output, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AudioApiService, SceneApiService, SceneEntity, TagEntity, TrackApiService, TrackEntity } from "../../../api";
import { TagMultiSelectComponent } from "../../../components/tag-multi-select/tag-multi-select";
import { Subject } from "rxjs";
import { TrackInputField } from "../../../components/track_input_field/track-input-field";

@Component({
    selector: 'wit-scene-row',
    imports: [CommonModule, FormsModule, TagMultiSelectComponent, TrackInputField],
    templateUrl: './scene-row.html',
    styleUrl: './scene-row.scss'
})
export class SceneRow implements OnInit {

    private readonly sceneService = inject(SceneApiService);
    private readonly trackService = inject(TrackApiService);
    private audioService = inject(AudioApiService);
    private readonly cd = inject(ChangeDetectorRef);

    clearInputValues$ = new Subject<void>();

    tracks: TrackEntity[] = [];
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
            introTrack: this.scene()?.introTrack ?? undefined,
            tags: [...(this.scene()?.tags || [])]
        }
    }

    saveEdit(event: MouseEvent) {
        event.stopPropagation();
        if (!this.isEditingScene) return;

        const id: any = this.scene()?.id;
        this.updateScene(id, null);
    }

    private updateScene(id: any, track: any) {
        this.sceneService.updateScene(id, {
            title: this.editBuffer.title,
            introTrack: this.editBuffer.introTrack,
            tags: this.editBuffer.tags
        }).subscribe(() => {
            this.cancelEdit(undefined);
            this.changeEvent.emit(this.scene);
        });
    }

    cancelEdit(event: MouseEvent | undefined) {
        if (event) event.stopPropagation();
        this.isEditingScene = false;
        this.clearInputValues$.next();
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

    setTags(tags: TagEntity[]) {
        this.editBuffer.tags = tags;
    }

    get tracksForScene() {
        if (this.scene() == null) return [];

        if (!this.scene()?.tags || this.scene()?.tags?.length === 0) {
            return [];
        }

        return this.tracks.filter(track =>
            this.scene()?.tags?.map(t => t.name).every((tag: string | undefined) =>
                track.tags?.find(tag2 => tag2.name === tag)
            )
        ).sort((a, b) => {
            const titleA = a.title?.toLowerCase() ?? '';
            const titleB = b.title?.toLowerCase() ?? '';

            return titleA.localeCompare(titleB);
        });
    }

    get tags() {
        return this.scene()?.tags;
    }

    get sceneId() {
        return this.scene()?.id;
    }

}