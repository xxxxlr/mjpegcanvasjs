/**
 * @author Russell Toris - rctoris@wpi.edu
 */

/**
 * A Viewer can be used to stream a single MJPEG topic into a canvas.
 *
 * Emits the following events:
 *   * 'warning' - emitted if the given topic is unavailable
 *   * 'change' - emitted with the topic name that the canvas was changed to
 *
 * @constructor
 * @param options - possible keys include:
 *   * divID - the ID of the HTML div to place the canvas in
 *   * width - the width of the canvas
 *   * height - the height of the canvas
 *   * host - the hostname of the MJPEG server
 *   * port (optional) - the port to connect to
 *   * quality (optional) - the quality of the stream (from 1-100)
 *   * topic - the topic to stream, like '/l_forearm_cam/image_color'
 */
MJPEGCANVAS.Viewer = function(options) {
  var that = this;
  options = options || {};
  var divID = options.divID;
  this.width = options.width;
  this.height = options.height;
  this.host = options.host;
  this.port = options.port || 8080;
  this.quality = options.quality;
  var topic = options.topic;

  // create no image initially
  this.image = new Image();

  // used if there was an error loading the stream
  var errorIcon = new MJPEGCANVAS.ErrorIcon();

  // create the canvas to render to
  var canvas = document.createElement('canvas');
  canvas.width = this.width;
  canvas.height = this.height;
  canvas.style.background = '#aaaaaa';
  document.getElementById(divID).appendChild(canvas);
  var context = canvas.getContext('2d');

  /**
   * A function to draw the image onto the canvas.
   */
  function draw() {
    // clear the canvas
    canvas.width = canvas.width;
    // grab the current sizes of the canvas
    var width = canvas.getAttribute('width');
    var height = canvas.getAttribute('height');

    // check if we have a valid image
    if (that.image.width * that.image.height > 0) {
      context.drawImage(that.image, 0, 0, width, height);
    } else {
      // center the error icon
      context.drawImage(errorIcon.image, (width - (width / 2)) / 2, (height - (height / 2)) / 2,
          width / 2, height / 2);
      that.emit('warning', 'Invalid stream.');
    }
  }

  // grab the initial stream
  this.changeStream(topic);

  // redraw the image every 30ms
  setInterval(draw, 30);
};
MJPEGCANVAS.Viewer.prototype.__proto__ = EventEmitter2.prototype;

/**
 * Change the stream of this canvas to the given topic.
 *
 * @param topic - the topic to stream, like '/l_forearm_cam/image_color'
 */
MJPEGCANVAS.Viewer.prototype.changeStream = function(topic) {
  this.image = new Image();
  // create the image to hold the stream
  var src = 'http://' + this.host + ':' + this.port + '/stream?topic=' + topic;
  // add various options
  src += '?width=' + this.width;
  src += '?height=' + this.height;
  if (this.quality > 0) {
    src += '?quality=' + this.quality;
  }
  this.image.src = src;
  // emit an event for the change
  this.emit('change', topic);
};
