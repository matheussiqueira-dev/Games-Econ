import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityItem } from './activity-item';
import { iActivity, ActivityType } from '../../interfaces/activity.interface';

describe('ActivityItem', () => {
  let component: ActivityItem;
  let fixture: ComponentFixture<ActivityItem>;

  const mockActivity: iActivity = {
    id: '1',
    type: ActivityType.Achievement,
    title: 'Achievement Unlocked',
    description: 'Test achievement',
    timestamp: '2h ago',
    icon: '🏆',
    iconColor: '#22c55e'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('activity', mockActivity);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
