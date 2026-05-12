import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackView } from './track-view';

describe('TrackView', () => {
  let component: TrackView;
  let fixture: ComponentFixture<TrackView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackView],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
