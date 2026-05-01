import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { DiscordInfoControllerService, DiscordStatusDTO } from "../../api";
import { interval, switchMap } from "rxjs";

@Component({
    selector: 'wit-progress-bar',
    imports: [CommonModule],
    templateUrl: './progress-bar.html',
    styleUrl: './progress-bar.scss'
})
export class ProgressBar implements OnInit {

    private readonly discordService = inject(DiscordInfoControllerService);
    private readonly cd = inject(ChangeDetectorRef);

    discordInfo: DiscordStatusDTO = {};
    progress: number = 0;
    currentPosition: number = 0;
    currentDuration: number = 0;
    lastUpdateTime: number = 0;
    intervalId: any;

    ngOnInit(): void {
        interval(3000)
            .pipe(
                switchMap(() => this.discordService.getInfo())
            ).subscribe(data => {
                this.discordInfo = data;
                this.updateProgress();
                this.cd.detectChanges();
            });
    }

    updateProgress(): void {
        this.currentPosition = this.discordInfo.voiceStatus?.trackPosition ?? 0;
        this.currentDuration = this.discordInfo.voiceStatus?.trackDuration ?? 0;

        this.lastUpdateTime = Date.now();

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            const elapsed = Date.now() - this.lastUpdateTime;
            const position = this.currentPosition + elapsed;
            this.progress = this.currentDuration ? (position / this.currentDuration) * 100 : 0;
        }, 250);
    }

    formatTime(ms: number): string {
        if (!ms) return '0:00';

        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

}