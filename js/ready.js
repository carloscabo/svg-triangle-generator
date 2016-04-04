var
  tpl = {
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="{{w}}" height="{{h}}" viewBox="0 0 {{w}} {{h}}"><path d="{{path}}" fill="{{color}}"/></svg>',
    // Debug circle shape
    // <circle cx="{{cx}}" cy="{{cy}}" r="{{r}}" fill="#ccc"/>
    img: '<img src="data:image/svg+xml,{{svg}}">',
    bg: 'background-image:url("data:image/svg+xml,{{svg}}");',
    pseudo: 'content: url("data:image/svg+xml,{{svg}}");',
    down: "data:application/octet-stream;charset=utf-8,{{svg}}'"
  },
  default_settings = {
    cx: 0, // Center x
    cy: 0, // Center y
    w: 0,  // Width
    h: 0,  // Height
    r: 0,  // Radius
    p: 1,  // Padding
    a: 0,  // Rotation angle
    fill: '#000',
    points: [],
    path: '' // Resulting path
  },
  set = {};

$(document).ready(function(){
  //La magia aquí

  // Events
  $(document).on('change', '#rotation-angle-range', function(e) {
    $('#rotation-angle').val( $(this).val() );
  })
  .on('change paste keyup', '#rotation-angle', function(e) {
    $('#rotation-angle-range').val( $(this).val() );
  })
  .on('change paste keyup', 'input[type="number"], input[type="range"], input[type="color"], input#trim-whitespace', function(e) {
    generateAll();
  })
  .on('click', 'button[data-angle]', function(e) {
    $('#rotation-angle').val( $(this).attr('data-angle') ).trigger('change');
  });

  // First run
  $('input[type="number"]').first().trigger('change');

});

// fn

function generateAll() {
  readVars();
  calculatePoints();
  if($('input#trim-whitespace').prop('checked')) {
    trimWhiteSpace();
  }
  createSvgPath();
}

// Read values from UI
function readVars () {
  set = null;
  set = $.extend({}, default_settings);

  set.p = parseInt( $('#svg-padding').val() , 10 );
  set.r = parseFloat( $('#triangle-radius').val() );
  set.cx = set.r + set.p;
  set.cy = set.cx;
  set.w = set.cx * 2;
  set.h = set.cy * 2;
  set.fill = $('#fill-color').val();
  set.a = parseFloat( $('#rotation-angle-range').val().replace(',','.') );
}

// Calculate triangle point fron center
function calculatePoints() {
  var
    inc = 120, // Degrees
    a = set.a;

  set.points.length = 0;

  for (var i = 0; i < 3; i++) {
    var
      rad = ( a + ( inc * i ) ) * ( Math.PI / 180 ), // Radians
      px = set.cx + set.r * Math.cos(rad),
      py = set.cy + set.r * Math.sin(rad);

    // Round to decimal places
    px = roundF2d( px );
    py = roundF2d( py );
    set.points.push( [ px, py ] );
  }
  // console.log(set.points);
}

// Create SVG path triangle coordinates
function createSvgPath() {
  for (var i = 0; i < set.points.length; i++) {
    set.points[i] = set.points[i].join(' ');
  }
  set.path = 'M' + set.points.join('L') + 'z';
  createSvgOutput();
}

// Create final SVG Output and string
function createSvgOutput() {
  var
    out = {};

  // Create SVG code
  out.svg = tpl.svg.replace(/\{\{w\}\}/g, set.w).replace(/\{\{h\}\}/g, set.h).replace('{{path}}', set.path).replace('{{color}}', set.fill ).replace('{{cx}}', set.cx).replace('{{cy}}', set.cy).replace('{{r}}', set.r);
  out.svg_escaped = escape(out.svg);

  out.img        = tpl.img.replace('{{svg}}', out.svg.replace(/"/g,"'").replace(/#/g, '%23') );
  out.bg         = tpl.bg.replace('{{svg}}', out.svg.replace(/"/g,"'").replace(/#/g, '%23') );
  out.pseudo     = tpl.pseudo.replace('{{svg}}', out.svg.replace(/"/g,"'").replace(/#/g, '%23') );
  // Escaped
  out.img_esc    = tpl.img.replace('{{svg}}', out.svg_escaped);
  out.bg_esc     = tpl.bg.replace('{{svg}}', out.svg_escaped);
  out.pseudo_esc = tpl.pseudo.replace('{{svg}}', out.svg_escaped);
  // Donload file
  out.down       = tpl.down.replace('{{svg}}', escape(out.svg) );

  $('#resulting-svg-code').val( out.svg );

  $('#resulting-svg-inline-img').val( out.img );
  $('#resulting-svg-css-background').val( out.bg );
  $('#resulting-svg-inline-pseudo').val( out.pseudo );
  $('#resulting-svg-inline-img-escaped').val( out.img_esc );
  $('#resulting-svg-css-background-escaped').val( out.bg_esc );
  $('#resulting-svg-inline-pseudo-escaped').val( out.pseudo_esc );

  $('#container-preview').attr('style', out.bg_esc );

  $('#download-file').attr('href', out.down ).attr('download', 'triangle-w'+set.w+'-h'+set.h+'-r'+set.r+'-f'+set.fill.replace('#','')+'.svg');

  // $('#container-preview').attr('style', out.bg.replace(/\"/g, "'") );
  // console.log( out.bg.replace(/\"/g, "'"));
}

// Loop all point to find maximun and minimun coordinates
// Recalculate final width / height
// Shift all the point to fit new viewport
function trimWhiteSpace() {
  console.log("----\n", set);
  var
    min_x = 99999,
    max_x = 0,
    min_y = 99999,
    max_y = 0;
  for (var i = 0; i < set.points.length; i++) {
    if ( set.points[i][0] < min_x ) min_x = set.points[i][0];
    if ( set.points[i][0] > max_x ) max_x = set.points[i][0];
    if ( set.points[i][1] < min_y ) min_y = set.points[i][1];
    if ( set.points[i][1] > max_y ) max_y = set.points[i][1];
  }
  console.log( min_x, max_x, min_y, max_y);
  var
    new_w = max_x - min_x + (set.p * 2),
    new_h = max_y - min_y + (set.p * 2),
    d_w = set.w - new_w,
    d_h = set.h - new_h;
  console.log('new_w', new_w, 'new_h', new_h);
  set.w = Math.ceil(new_w);
  set.h = Math.ceil(new_h);
  for (var j = 0; j < set.points.length; j++) {
    set.points[j][0] = roundF2d( set.points[j][0] - min_x );
    set.points[j][1] = roundF2d( set.points[j][1] - min_y );
  }
  console.log(set);
}

function roundF2d (x) {
  return Math.round( x * 100) / 100;
}

/* Seems that using plain JS escape() outputs a slightly smaller string that is IE9+ compatible */
/* From http://meyerweb.com/eric/tools/dencoder/ */
/*
function em_encode( unencoded ) {
  return encodeURIComponent( unencoded ).replace(/'/g,"%27").replace(/"/g,"%22");
}
function em_decode( encoded ) {
  return decodeURIComponent(encoded.replace(/\+/g,  " "));
}
*/
