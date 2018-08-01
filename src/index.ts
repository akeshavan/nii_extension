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
    //

    var Base64Binary = {
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        /* will return a  Uint8Array type */
        decodeArrayBuffer: function(input: any) {
            var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));
            var lkey2 = this._keyStr.indexOf(input.charAt(input.length-2));

            var bytes = (input.length/4) * 3;
            if (lkey1 == 64) bytes--; //padding chars, so skip
            if (lkey2 == 64) bytes--; //padding chars, so skip

            var ab = new ArrayBuffer(bytes);
            this.decode(input, ab, bytes);

            return ab;
        },

        decode: function(input: any, arrayBuffer: any, bytes: any) {
            var uarray;
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            var j = 0;

            if (arrayBuffer)
                uarray = new Uint8Array(arrayBuffer);
            else
                uarray = new Uint8Array(bytes);

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            for (i=0; i<bytes; i+=3) {
                //get the 3 octects in 4 ascii chars
                enc1 = this._keyStr.indexOf(input.charAt(j++));
                enc2 = this._keyStr.indexOf(input.charAt(j++));
                enc3 = this._keyStr.indexOf(input.charAt(j++));
                enc4 = this._keyStr.indexOf(input.charAt(j++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                uarray[i] = chr1;
                if (enc3 != 64) uarray[i+1] = chr2;
                if (enc4 != 64) uarray[i+2] = chr3;
            }

            return uarray;
        }
    }

    papaya.volume.Volume.prototype.readNextEncodedData = function (vol: any, index: any , names: any) {
        if (index < names.length) {
            try {
                //console.log('base64 stuffff', names[index], index);
                vol.rawData[index] = Base64Binary.decodeArrayBuffer(names[index]);
                vol.compressed = this.fileIsCompressed(this.fileName, vol.rawData[index]);
                setTimeout(function () {vol.readNextEncodedData(vol, index + 1, names); }, 0);
            } catch (err) {
                if (vol) {
                    vol.error = new Error("There was a problem reading that file:\n\n" + err.message);
                    vol.finishedLoad();
                }
            }
        } else {
            vol.decompress(vol);
        }
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
