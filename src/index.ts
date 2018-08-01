import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces';



import {
  Widget
} from '@phosphor/widgets';

import '../style/index.css';
import '../style/papaya.css';

/**
 * The default mime type for the extension.
 */
const MIME_TYPE = 'application/nii';


/**
 * The class name added to the extension.
 */
const CLASS_NAME = 'mimerenderer-nii';
declare var papaya: any;
declare var papayaLoadableImages: any;

/**
 * A widget for rendering nii.
 */
export
class OutputWidget extends Widget implements IRenderMime.IRenderer {
  /**
   * Construct a new output widget.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this._mimeType = options.mimeType;
    this.addClass(CLASS_NAME);

    // AK's hack:
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://cdn.rawgit.com/rii-mango/Papaya/67d9734a/release/current/standard/papaya.js'; //'https://cdn.rawgit.com/rii-mango/Papaya/67d9734a/release/current/nojquery/papaya.js';
    s.onload = () => {
      console.log('papaya_object')
      papaya.Container.addViewer('papaya', {}, function(){
        console.log('here is this callback 6');
      });
      this._papaya = papaya;
    };
    this.node.appendChild(s);

    // Add an image element to the panel
    let pdiv = document.createElement('div');
    pdiv.style.height = "0px";
    pdiv.classList.add("papaya");
    pdiv.id = "papaya";
    this.node.appendChild(pdiv);

  }

  /**
   * Render nii into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {

    let data = model.data[this._mimeType] as string;

    papaya.utilities.ObjectUtils.dereference = function (name: string) {
      return name;
    };
    // papaya.foodata = data;
    papayaLoadableImages.push({
      name: 'foo.nii',
      encode: data,
    });
    this._papaya.Container.resetViewer(0, {encodedImages: ['foo.nii'], files:['foo.nii'], name:'foo.nii'});
    console.log(this._mimeType);
    console.log(this._papaya);
    //this.node.textContent = data;

    return Promise.resolve();

  }

  private _mimeType: string;
  private _papaya: any;
}


/**
 * A mime renderer factory for nii data.
 */
export
const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [MIME_TYPE],
  createRenderer: options => new OutputWidget(options)
};

/**
 * Extension definition.
 */
const extension: IRenderMime.IExtension = {
  id: 'niiext:plugin',
  rendererFactory,
  rank: 0,
  dataType: 'string',
  fileTypes: [{
    name: 'nii',
    mimeTypes: [MIME_TYPE],
    fileFormat: 'base64',
    extensions: ['.nii', '.nii.gz'],
  }],
  documentWidgetFactoryOptions: {
    name: 'nii_viewer',
    modelName: 'base64',
    primaryFileType: 'nii',
    fileTypes: ['nii', 'niigz'],
    defaultFor: ['nii', 'niigz'],
  }
};

export default extension;
