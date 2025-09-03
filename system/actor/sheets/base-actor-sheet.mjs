const { api, sheets } = foundry.applications;
import { ROLActor } from "../actor.mjs";
import { ROLActorItemDrop } from "../actor-item-drop.mjs";


export class ROLActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
  constructor(options = {}) {
    super(options);
    this._dragDrop = this._createDragDropHandlers();
  }

  static DEFAULT_OPTIONS = {
    classes: ['rol', 'sheet', 'actor'],
    position: {
      width: 587,
      height: 800
    },
    window: {
      resizable: true,
    },
    tag: "form",
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    form: {
      submitOnChange: true,
    },
    actions: {
      onEditImage: this._onEditImage,
      viewDoc: this._viewDoc,
      toggleActor: this._toggleActor,
      createDoc: this._createDoc,
      deleteDoc: this._deleteDoc,
      itemToggle: this._itemToggle,
      otherToggle: this._onOtherToggle,
    }
  }


  async _prepareContext(options) {
    return {
      editable: this.isEditable,
      isOwner: this.document.isOwner,
      limited: this.document.limited,
      actor: this.actor,
      flags: this.actor.flags,
      isGM: game.user.isGM,
      fields: this.document.schema.fields,
      config: CONFIG.AOV,
      system: this.actor.system,
      isLocked: this.actor.system.flags.locked,
      isDevelopment: game.settings.get('rol','developmentEnabled'),
      isCreation: game.settings.get('rol','characterCreation'),
      isSession: game.settings.get('rol','sessionendEnabled'),
      isDemiMonde: game.settings.get('rol','demiMonde'),
      isLuckDetail: game.settings.get('rol','luckExtend'),
      maxStats: game.settings.get('rol','maxStats'),
      isLargeFont: game.settings.get('rol','largeFont'),
    };
  }

  //------------ACTIONS-------------------

  // Change Image
  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
      {};
    const fp = new foundry.applications.apps.FilePicker({
      current,
      type: 'image',
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 39,
      left: this.position.left + 9,
    });
    return fp.browse();
  }

  // View Embedded Document
  static async _viewDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    doc.sheet.render(true);
  }

  static async _deleteDoc(event, target) {
    if (event.detail === 2) {  //Only perform on double click
      const doc = this._getEmbeddedDocument(target);
      await doc.delete();
    }
  }

  //Get Embedded Document
  _getEmbeddedDocument(target) {
    const docRow = target.closest('li[data-document-class]');
    if (docRow.dataset.documentClass === 'Item') {
      return this.actor.items.get(docRow.dataset.itemId);
    } else return console.warn('Could not find document class');
  }

  //Toggle aspects of the actor
  static _toggleActor(event,target) {
    event.stopPropagation();
    let checkProp={}
    let prop = target.dataset.property
    if (['tweak'].includes(prop)) {
      checkProp = { [`system.${prop}`]: !this.actor.system[prop] }
    } else if (prop === 'locked') {
      checkProp = { 'system.flags.locked': !this.actor.system.flags.locked }
    } else {  
      return
    }
    this.actor.update(checkProp)
  }


  //Toggle an item
  static _itemToggle(event, target) {
    event.stopImmediatePropagation();
    let checkProp = {};
    const prop = target.dataset.property;
    const itemId = target.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (['xpCheck'].includes(prop)) {
      checkProp = { [`system.${prop}`]: !item.system[prop] }
    } else { return }
    item.update(checkProp);
  }

  //Create an Embedded Document
  static async _createDoc(event, target) {
    const docCls = getDocumentClass(target.dataset.documentClass);
    const docData = {
      name: docCls.defaultName({
        type: target.dataset.type,
        parent: this.actor,
      }),
    };
    // Loop through the dataset and add it to our docData
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      // Ignore data attributes that are reserved for action handling
      if (['action', 'documentClass'].includes(dataKey)) continue;
      foundry.utils.setProperty(docData, dataKey, value);
    }
    // Create the embedded document
    const newItem = await docCls.create(docData, { parent: this.actor });

    //And in certain circumstances render the new item sheet
    if (['gear','wound','family','thrall'].includes(newItem.type)) {
      newItem.sheet.render(true);
    }
  }

  static async _onOtherToggle(event, target) {
    event.preventDefault();
    const prop=target.dataset.property;
    const state=this.actor.system.properties[prop];
    let checkProp={};
    if (prop==='impaired' && state === true) {
      checkProp={'system.properties.impaired' : false};
    } else if (prop==='impaired' && state === false) {
      checkProp={'system.properties.impaired' : true};
    } else if (prop==='htd' && state === true) {
      checkProp={'system.properties.htd' : false};
    } else if (prop==='htd' && state === false) {
      checkProp={'system.properties.htd' : true};
    } else if (prop==='hurt' && state === true) {
      checkProp={'system.properties.hurt' : false, 'system.damage.value': 0};
    } else if (prop==='hurt' && state === false) {
      checkProp={'system.properties.hurt' : true,'system.properties.bloodied' : false, 'system.damage.value': 1};
    } else if (prop==='bloodied' && state === true) {
      checkProp={'system.properties.bloodied' : false,'system.properties.hurt' : true, 'system.damage.value': 1};
    } else if (prop==='bloodied' && state === false) {
      checkProp={'system.properties.bloodied' : true, 'system.properties.hurt' : false, 'system.damage.value': 2};
    } else if (prop==='trauma' && state === true) {
      checkProp={'system.properties.trauma' : false};
    } else if (prop==='trauma' && state === false) {
      checkProp={'system.properties.trauma' : true};
    } else if (prop==='disfigured' && state === true) {
    checkProp={'system.properties.disfigured' : false};
    } else if (prop==='disfigured' && state === false) {
      checkProp={'system.properties.disfigured' : true};
    } else if (prop==='typeNPC') {
      checkProp={'system.charType' : "Npc"};
    } else if (prop==='typeDemi') {
      checkProp={'system.charType' : "DemiMonde"};
    } else if (prop==='typeCreature') {
      checkProp={'system.charType' : "Creature"};
    } else if (prop==='typeInv') {
      checkProp={'system.charType' : "Investigator"};
    }  
    await this.actor.update(checkProp);
  }




  //-------------Drag and Drop--------------

  // Define whether a user is able to begin a dragstart workflow for a given drag selector
  _canDragStart(selector) {
    return this.isEditable;
  }

  //Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
  _canDragDrop(selector) {
    return this.isEditable;
  }

  //Callback actions which occur at the beginning of a drag start workflow.
  _onDragStart(event) {
    const docRow = event.currentTarget.closest('li');
    if ('link' in event.target.dataset) return;
    // Chained operation
    let dragData = this._getEmbeddedDocument(docRow)?.toDragData();
    if (!dragData) return;
    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  //Callback actions which occur when a dragged element is over a drop target.
  _onDragOver(event) { }

  //Callback actions which occur when a dragged element is dropped on a target.
  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call('dropActorSheetData', actor, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case 'ActiveEffect':
        return this._onDropActiveEffect(event, data);
      case 'Actor':
        return this._onDropActor(event, data);
      case 'Item':
        return this._onDropItem(event, data);
      case 'Folder':
        return this._onDropFolder(event, data);
    }
  }

  //Handle the dropping of ActiveEffect data onto an Actor Sheet
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass('ActiveEffect');
    const effect = await aeCls.fromDropData(data);
    if (!this.actor.isOwner || !effect) return false;
    return aeCls.create(effect, { parent: this.actor });
  }

  //Handle dropping of an Actor data onto another Actor sheet
  async _onDropActor(event, data) {
    if (!this.actor.isOwner) return false;
  }

  //Handle dropping of an item reference or item data onto an Actor Sheet
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid)
      return this._onSortItem(event, item);
    // Create the owned item
    return this._onDropItemCreate(item, event);
  }

  //Handle dropping of a Folder on an Actor Sheet.
  async _onDropFolder(event, data) {
    if (!this.actor.isOwner) return [];
    const folder = await Folder.implementation.fromDropData(data);
    if (folder.type !== 'Item') return [];
    const droppedItemData = await Promise.all(
      folder.contents.map(async (item) => {
        if (!(document instanceof Item)) item = await fromUuid(item.uuid);
        return item;
      })
    );
    return this._onDropItemCreate(droppedItemData, event);
  }

  //Handle the final creation of dropped Item data on the Actor.
  async _onDropItemCreate(itemData, event) {
    itemData = await ROLActorItemDrop._ROLonDropItemCreate(itemData, this.actor)
    //itemData = itemData instanceof Array ? itemData : [itemData];
    const list = await this.actor.createEmbeddedDocuments('Item', itemData);
    return list;
  }

  //Returns an array of DragDrop instances
  get dragDrop() {
    return this._dragDrop;
  }

  _dragDrop;

  //Create drag-and-drop workflow handlers for this Application
  _createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new foundry.applications.ux.DragDrop(d);
    });
  }


//--------Implement Font Size and other changes--------------//
  static renderSheet(sheet, html) {
    if (game.settings.get('rol', 'largeFont')) {
      document.body.style.setProperty('--rol-prim-font-size', '18px');
      document.body.style.setProperty('--rol-sec-font-size', '18px');    
      document.body.style.setProperty('--rol-ter-font-size', '18px');            
    }

  }  
}
