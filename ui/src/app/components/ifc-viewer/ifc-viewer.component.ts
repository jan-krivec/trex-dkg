import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import * as WEBIFC from "web-ifc";
import * as BUI from "@thatopen/ui";
import * as OBC from '@thatopen/components';
import * as OBCF from "@thatopen/components-front";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {IfcViewerService} from "./ifc-viewer.service";
import * as FRAGS from "@thatopen/fragments";
import {DomSanitizer} from "@angular/platform-browser";
import * as CUI from "./tables";
import {TemplateResult} from "lit";
import {TableRowData} from "@thatopen/ui/dist/components/Table/src/types";
import {HttpClient} from "@angular/common/http";
import {IfcViewerDetailCompontent} from "./ifc-viewer-detail.compontent";
import {MatDialog} from "@angular/material/dialog";
import {DkgService} from "../../services/dkg.service";

interface ElementPropertiesUIState {
  components: OBC.Components;
  fragmentIdMap: FRAGS.FragmentIdMap;
}

type UpdateFunction<S extends Record<string, any>> = (state?: Partial<S>) => S;

@Component({
  selector: 'app-ifc-viewer',
  templateUrl: './ifc-viewer.component.html',
  styleUrls: ['./ifc-viewer.component.css']
})
export class IfcViewerComponent implements OnInit, AfterViewInit{
  private container: HTMLElement;
  private components: OBC.Components;
  private world: any;
  private highlighter: OBCF.Highlighter;
  public attributesTable: any;
  public updateAttributesTable: UpdateFunction<any>;
  public propertiesTable: any;
  public updatePropertiesTable: UpdateFunction<any>;
  public indexer: OBC.IfcRelationsIndexer;
  public relationsTree: any;
  public fragmentsManager: OBC.FragmentsManager;
  public ifcLoader: OBC.IfcLoader;

  tableDefinition: BUI.TableDataTransform = {
    Actions: (expressID) => {
      return BUI.html`
      <div style="position: relative; min-height: 30px;">
        <bim-button
          style="position: absolute; right: -340px;"
          @click=${() => this.openDialog(expressID)}
          label="Edit">
        </bim-button>
      </div>
    `;
    }
  }

  baseStyle: Record<string, string> = {
    padding: "0.25rem",
    borderRadius: "0.25rem",
  };

  @ViewChild('table', { static: false }) tableElement!: ElementRef;
  @ViewChild('relationsTree', { static: false }) relationsTreeElement!: ElementRef;

  constructor(private el: ElementRef, private dkgService: DkgService, private sanitizer: DomSanitizer, private http: HttpClient, public dialog: MatDialog) {
  }

  async ngOnInit() {
    this.container = document.getElementById("container")!;

    this.components = new OBC.Components();

    const worlds = this.components.get(OBC.Worlds);

    this.world = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBCF.PostproductionRenderer
      >();

    this.world.scene = new OBC.SimpleScene(this.components);
    this.world.renderer = new OBCF.PostproductionRenderer(this.components, this.container);
    this.world.camera = new OBC.SimpleCamera(this.components);

    this.components.init();

    this.world.renderer.postproduction.enabled = true;

    this.world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

    this.world.scene.setup();

    const grids = this.components.get(OBC.Grids);
    const grid = grids.create(this.world);
    this.world.renderer.postproduction.customEffects.excludedMeshes.push(grid.three);

    this.ifcLoader = this.components.get(OBC.IfcLoader);
    await this.ifcLoader.setup();


    this.indexer = this.components.get(OBC.IfcRelationsIndexer);

    this.highlighter = this.components.get(OBCF.Highlighter);
    this.highlighter.setup({ world: this.world });
    this.highlighter.zoomToSelection = true;


    this.highlighter.events['select'].onHighlight.add(async (fragmentIdMap) => {
      await this.updatePropertiesTable({ fragmentIdMap });
    });

    this.highlighter.events['select'].onClear.add(() =>
      this.updatePropertiesTable({ fragmentIdMap: {} }),
    );
  }

  ngAfterViewInit() {
    this.loadIfc();
  }

  onAttributesChange(e: Event) {
    const dropdown = e.target as BUI.Dropdown;
    this.updateAttributesTable({
      attributesToInclude: () => {
        const attributes: any[] = [
          ...dropdown.value,
          (name: string) => name.includes("Value"),
          (name: string) => name.startsWith("Material"),
          (name: string) => name.startsWith("Relating"),
          (name: string) => {
            const ignore = ["IsGroupedBy", "IsDecomposedBy"];
            return name.startsWith("Is") && !ignore.includes(name);
          },
        ];
        return attributes;
      },
    });
  };

  setPropertiesTable() {
    const [propertiesTable, updatePropertiesTable] = CUI.tables.elementProperties({
      components: this.components,
      tableDefinition: this.tableDefinition,
      fragmentIdMap: {},
      getFunction: async (expressId) => {return this.dkgService.queryExpressId2(expressId)}
    });

    this.propertiesTable = propertiesTable;
    this.updatePropertiesTable = updatePropertiesTable;

    propertiesTable.preserveStructureOnFilter = true;
    propertiesTable.indentationInText = false;

    this.tableElement.nativeElement.appendChild(this.propertiesTable);
  }

  setRelationsTree(model: any) {
    const [relationsTree] = CUI.tables.relationsTree({
      components: this.components,
      models: [model],
    });

    this.relationsTree = relationsTree;
    this.relationsTree.preserveStructureOnFilter = true;

    this.relationsTreeElement.nativeElement.appendChild(this.relationsTree);
  }

  makeGlobalIdButton(globalId: string, onClick: () => void) {
    const button = document.createElement("bim-button");
    button.label = globalId

    button.style.color= "white";
    button.style.borderStyle= "solid";
    button.style.borderWidth= "2px";
    button.style.borderColor= "gray";
    button.style.borderRadius= "5px";
    button.style.cursor= "pointer";
    button.style.visibility= "visible";
    button.style.display= "inline-block";
    button.style.wordWrap = "break-word";

    button.addEventListener("click", function(event) {
      event.stopPropagation();
      onClick();
    });

    return button;
  }

  onSearchInput(e: Event) {
    const input = e.target as BUI.TextInput;
    this.attributesTable.queryString = input.value;
  };

  onPreserveStructureChange(e: Event) {
    const checkbox = e.target as BUI.Checkbox;
    this.attributesTable.preserveStructureOnFilter = checkbox.checked;
  };

  onExportJSON() {
    this.attributesTable.downloadData("entities-attributes");
  };

  async onCopyTSV() {
    await navigator.clipboard.writeText(this.attributesTable.tsv);
    alert(
      "Table data copied as TSV in clipboard! Try to paste it in a spreadsheet app.",
    );
  };

  onTextInput(e: Event) {
    const input = e.target as BUI.TextInput;
    this.propertiesTable.queryString = input.value !== "" ? input.value : null;
  }

  expandTable(e: Event){
    const button = e.target as BUI.Button;
    this.propertiesTable.expanded = !this.propertiesTable.expanded;
    button.label = this.propertiesTable.expanded ? "Collapse" : "Expand";
  };

  copyAsTSV = async () => {
    await navigator.clipboard.writeText(this.propertiesTable.tsv);
  }

  onGlobalIdButtonClick(globalId: string, data: TableRowData) {
    console.log(`Button clicked for model ID: ${globalId}`);
    console.log('Additional row data:', data);

  }

  getTableDefinition() {
    return {
      Entity: (entity) => {
        let style = {};
        if (entity === OBC.IfcCategoryMap[WEBIFC.IFCPROPERTYSET]) {
          style = {
            ...this.baseStyle,
            backgroundColor: "purple",
            color: "white",
          };
        }
        if (String(entity).includes("IFCWALL")) {
          style = {
            ...this.baseStyle,
            backgroundColor: "green",
            color: "white",
          };
        }
        return BUI.html`<bim-label style=${BUI.styleMap(style)}>${entity}</bim-label>`;
      },
      PredefinedType: (type) => {
        const colors = ["#1c8d83", "#3c1c8d", "#386c19", "#837c24"];
        const randomIndex = Math.floor(Math.random() * colors.length);
        const backgroundColor = colors[randomIndex];
        const style = { ...this.baseStyle, backgroundColor, color: "white" };
        return BUI.html`<bim-label style=${BUI.styleMap(style)}>${type}</bim-label>`;
      },
      NominalValue: (value) => {
        let style = {};
        if (typeof value === "boolean" && value === false) {
          style = { ...this.baseStyle, backgroundColor: "#b13535", color: "white" };
        }
        if (typeof value === "boolean" && value === true) {
          style = { ...this.baseStyle, backgroundColor: "#18882c", color: "white" };
        }
        return BUI.html`<bim-label style=${BUI.styleMap(style)}>${value}</bim-label>`;
      },
    };
  }

  loadIfc = async () => {
    try {
      // Fetch the file from assets/data directory
      const response = await fetch(`assets/data/small.ifc`);
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }

      // Convert the response to array buffer
      const buffer = await response.arrayBuffer();
      const data = new Uint8Array(buffer);

      // Load the IFC model
      const model = await this.ifcLoader.load(data);
      model.name = 'small.ifc'.replace(".ifc", "");
      this.setModel(model);

      return model;
    } catch (error) {
      console.error('Error loading IFC file:', error);
      throw error;
    }
  };

  openDialog(expressId): void {
    console.log(expressId);
    const dialogRef = this.dialog.open(IfcViewerDetailCompontent, {
      data: {expressId: expressId},
      width: '30%',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  async setModel(model) {
    await this.indexer.process(model);
    if (this.world.scene.three) {
      this.world.scene.three.add(model);
    }

    this.setRelationsTree(model);
    this.setPropertiesTable();
  }
}
