import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SceneApiService, TagEntity, TrackApiService } from "../../api";
import { SceneRow } from "./scene-row/scene-row";
import { TrackInputField } from "../../components/track_input_field/track-input-field";
import { Track } from "../../api/model/track";
import { Subject } from "rxjs";
import { TagMultiSelectComponent } from "../../components/tag-multi-select/tag-multi-select";

@Component({
    selector: 'wit-scene-view',
    imports: [CommonModule, FormsModule, SceneRow, TrackInputField, TagMultiSelectComponent],
    templateUrl: './scene-view.html',
    styleUrl: './scene-view.scss',
})
export class SceneView implements OnInit {

    clearInputValues$ = new Subject<void>();

    tracks: any[] = [];
    scenes: any[] = [];
    filteredScenes: any[] = [];

    searchTerm: string = "";

    newScene: any = {
        title: '',
        introTrack: undefined,
        moodTags: []
    };

    private sceneService = inject(SceneApiService);
    private trackService = inject(TrackApiService);
    private cd = inject(ChangeDetectorRef);

    ngOnInit(): void {
        this.loadScenes();
        this.loadTracks();
    }

    loadScenes(): void {
        this.sceneService.getAllScenes().subscribe(data => {
            this.scenes = data;
            this.filteredScenes = data.sort((a, b) => {
                const titleA = a.title?.toLowerCase() ?? '';
                const titleB = b.title?.toLowerCase() ?? '';

                return titleA.localeCompare(titleB);
            });
            this.cd.detectChanges();
        });
    }

    private loadTracks(): void {
        this.trackService.getAllTracks().subscribe(data => {
            this.tracks = data;
            this.cd.detectChanges();
        });
    }

    applyFilter() {
        const term = this.searchTerm.toLowerCase();

        this.filteredScenes = this.scenes.filter(scene => {
            return (
                scene.title?.toLowerCase().includes(term) ||
                scene.introTrack?.title?.toLowerCase().includes(term) ||
                (scene.moodTags || []).some((tag: string) => tag.toLowerCase().includes(term)
                )
            );
        });
    }

    addScene() {
        this.createScene();
    }

    private createScene() {
        this.sceneService.createScene({
            title: this.newScene.title,
            introTrack: this.newScene.introTrack,
            tags: this.newScene.moodTags
        }).subscribe(() => {
            this.newScene = {
                title: '',
                introTrack: undefined,
                moodTags: []
            };
            this.clearInputValues$.next();

            this.loadScenes();
        })
    }

    setIntroTrack(track: Track | undefined) {
        this.newScene.introTrack = track;
    }

    setTags(tags: TagEntity[]) {
        this.newScene.moodTags = tags;
    }
}