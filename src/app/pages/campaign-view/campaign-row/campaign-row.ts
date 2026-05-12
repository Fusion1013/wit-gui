import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, input, OnInit, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CampaignApiService, CampaignEntity, TrackApiService } from "../../../api";

@Component({
    selector: 'wit-campaign-row',
    imports: [CommonModule, FormsModule],
    templateUrl: './campaign-row.html',
    styleUrl: './campaign-row.scss'
})
export class CampaignRow implements OnInit {

    private readonly trackService = inject(TrackApiService);
    private readonly campaignService = inject(CampaignApiService);
    private readonly cd = inject(ChangeDetectorRef);

    tracks: any[] = [];
    campaign = input<CampaignEntity>();
    changeEvent = output<any>();

    isEditingCampaign: boolean = false;
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

    saveEdit(event: MouseEvent) {
        event.stopPropagation();
        if (!this.isEditingCampaign) return;

        this.editBuffer.introTrackId = this.tracks.find(item => item.title === this.editBuffer.introTrackId)?.id;

        const id: any = this.campaign()?.id;

        if (this.editBuffer.introTrackId != null) {
            this.trackService.getTrack(this.editBuffer.introTrackId).subscribe(track => {
                this.updateCampaign(id, track);
            })
        } else {
            this.updateCampaign(id, null);
        }
    }

    private updateCampaign(id: any, track: any) {
        this.campaignService.updateCampaign(id, {
            name: this.editBuffer.name,
            introTrack: track
        }).subscribe(() => {
            this.cancelEdit(undefined);
            this.changeEvent.emit(this.campaign);
        });
    }

    cancelEdit(event: MouseEvent | undefined) {
        if (event) event.stopPropagation();
        this.isEditingCampaign = false;
        this.editBuffer = {};
    }

    startEdit(event: MouseEvent) {
        event.stopPropagation();
        this.isEditingCampaign = true;

        this.editBuffer = {
            ...this.campaign(),
            introTrackId: this.campaign()?.introTrack?.title ?? ''
        }
    }

    deleteCampaign(event: MouseEvent) {
        event.stopPropagation();
        this.campaignService.deleteCampaign(this.id).subscribe(() => {
            this.changeEvent.emit(this.campaign);
        });
    }

    toggleCampaignMoreInfo() {
        this.isExpanded = !this.isExpanded;
    }

    preventPropagation(event: MouseEvent) {
        event.stopPropagation();
    }

    get id(): any {
        return this.campaign()?.id;
    }

    get name(): string | undefined {
        return this.campaign()?.name;
    }

    get introTrackTitle(): string | undefined {
        return this.campaign()?.introTrack?.title;
    }

}