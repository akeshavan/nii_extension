import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces';



import {
  Widget
} from '@phosphor/widgets';

import '../style/index.css';

/**
 * The default mime type for the extension.
 */
const MIME_TYPE = 'application/nii';


/**
 * The class name added to the extension.
 */
const CLASS_NAME = 'mimerenderer-nii';


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
  }

  /**
   * Render nii into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    
    let data = model.data[this._mimeType] as string;
    this.node.textContent = data;
    
    return Promise.resolve();

  }

  private _mimeType: string;
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
    extensions: ['.nii'],
  }],
  documentWidgetFactoryOptions: {
    name: 'nii_viewer',
    primaryFileType: 'nii',
    fileTypes: ['nii'],
    defaultFor: ['nii'],
  }
};

export default extension;
