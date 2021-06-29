import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Configurator } from '../../../../core/model/configurator.model';
import { ConfiguratorAttributeProductCardComponentOptions } from '../../product-card/configurator-attribute-product-card.component';
import { ConfiguratorAttributeSingleSelectionBaseComponent } from '../base/configurator-attribute-single-selection-base.component';

@Component({
  selector: 'cx-configurator-attribute-single-selection-bundle-dropdown',
  templateUrl:
    './configurator-attribute-single-selection-bundle-dropdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguratorAttributeSingleSelectionBundleDropdownComponent
  extends ConfiguratorAttributeSingleSelectionBaseComponent
  implements OnInit {
  attributeDropDownForm = new FormControl('');
  selectionValue: Configurator.Value;

  @Input() group: string;

  ngOnInit() {
    this.attributeDropDownForm.setValue(this.attribute?.selectedSingleValue);

    //TODO CHHI error handling?
    if (this.attribute?.values && this.attribute?.values?.length > 0) {
      const value = this.attribute?.values.find((value) => value.selected);
      if (value) {
        this.selectionValue = value;
      }
    }
  }

  /**
   * Extract corresponding product card parameters
   *
   * @return {ConfiguratorAttributeProductCardComponentOptions} - New product card options
   */
  extractProductCardParameters(): ConfiguratorAttributeProductCardComponentOptions {
    return {
      hideRemoveButton: true,
      productBoundValue: this.selectionValue,
      singleDropdown: true,
      withQuantity: false,
      loading$: this.loading$,
      attributeId: this.getAttributeCode(this.attribute),
    };
  }
}
