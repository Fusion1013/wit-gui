import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AudioControllerService, SceneControllerService, TrackControllerService } from "../api";
import { SceneRow } from "./scene-row/scene-row";

@Component({
    selector: 'wit-scene-view',
    imports: [CommonModule, FormsModule, SceneRow],
    templateUrl: './scene-view.html',
    styleUrl: './scene-view.scss',
})
export class SceneView implements OnInit {

    tracks: any[] = [];
    scenes: any[] = [];
    filteredScenes: any[] = [];

    searchTerm: string = "";

    introTrackInput: string = '';
    tagsInput: string = '';
    newScene: any = {
        title: '',
        introTrackId: '',
        moodTags: []
    };

    private sceneService = inject(SceneControllerService);
    private trackService = inject(TrackControllerService);
    private cd = inject(ChangeDetectorRef);

    ngOnInit(): void {
        this.loadScenes();
        this.loadTracks();
    }

    loadScenes(): void {
        this.sceneService.getAllScenes().subscribe(data => {
            this.scenes = data;
            this.filteredScenes = data;
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
        this.newScene.moodTags = this.tagsInput
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);
        
        this.newScene.introTrackId = this.tracks.find(item => item.title === this.introTrackInput)?.id;

        if (this.newScene.introTrackId != null) {
            this.trackService.getTrack(this.newScene.introTrackId).subscribe(track => {
                this.createScene(track);
            });
        } else {
            this.createScene(null);
        }
    }

    private createScene(track: any) {
        this.sceneService.createScene({
            title: this.newScene.title,
            introTrack: track,
            moodTags: this.newScene.moodTags
        }).subscribe(() => {
            this.newScene = {
                title: '',
                introTrack: undefined,
                moodTags: []
            };
            this.tagsInput = '';
            this.introTrackInput = '';

            this.loadScenes();
        })
    }
}