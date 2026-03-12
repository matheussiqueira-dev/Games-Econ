import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Sidebar } from './sidebar';
import { CurrentLoggedInUserStore } from '../../storage/current-logged-in-user.store';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockUserStore: jasmine.SpyObj<CurrentLoggedInUserStore>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const userStoreSpy = jasmine.createSpyObj('CurrentLoggedInUserStore', ['logout']);

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: CurrentLoggedInUserStore, useValue: userStoreSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockUserStore = TestBed.inject(CurrentLoggedInUserStore) as jasmine.SpyObj<CurrentLoggedInUserStore>;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
