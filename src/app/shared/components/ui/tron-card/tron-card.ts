import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-tron-card',
  templateUrl: './tron-card.html',
  styleUrl: './tron-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TronCard {
  readonly image = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly category = input('Simulation');
  readonly description = input('');
  readonly details = input('');
  readonly ctaLabel = input('Launch');
  readonly selected = output<void>();

  protected readonly expanded = signal(false);
  protected readonly summary = computed(
    () =>
      this.description().trim() ||
      'ENCOM-ready module prepared for quick launch and immersive diagnostics.'
  );
  protected readonly extendedDetails = computed(
    () =>
      this.details().trim() ||
      'Adaptive telemetry, holographic feedback loops and low-latency controls remain active inside this protocol.'
  );

  protected onSelect(): void {
    this.selected.emit();
  }

  protected toggleExpanded(event: MouseEvent): void {
    event.stopPropagation();
    this.expanded.update((value) => !value);
  }
}
