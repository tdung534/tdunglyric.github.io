(function($){
	$.fn.jancolor = function(arg){
		return new jancolor(this, arg);
	};
})(jQuery);
function jancolor(t, a)
{
	this.setColor = function(color, model, noUpdate, noSubmit){
		if(typeof noUpdate=='undefined')
		{
			noUpdate = '';
		}
		if(model=='hsv')
		{
			var hsv = color;
			var rgb = hsv2rgb(hsv);
			var hex = hsv2hex(hsv);
		}
		else if(model=='rgb')
		{
			var rgb = color;
			rgb[0] = Math.min(255, Math.max(0, noNaN(rgb[0])));
			rgb[1] = Math.min(255, Math.max(0, noNaN(rgb[1])));
			rgb[2] = Math.min(255, Math.max(0, noNaN(rgb[2])));
			var hsv = rgb2hsv(rgb);
			var hex = rgb2hex(rgb);
		}
		else
		{
			var hex = color.toLowerCase();
			if(hex.charAt(0)=='#')
			{
				hex = hex.substr(1, 6);
			}
			else
			{
				hex = hex.substr(0, 6);
			}
			if(hex.length<6)
			{
				hex = ''+hex.charAt(0)+hex.charAt(0)+hex.charAt(1)+hex.charAt(1)+hex.charAt(2)+hex.charAt(2);
			}
			hex_reg = /[0-9a-f]/;
			nhex = '';
			for(var i = 0;i<6;i++)
			{
				if(hex_reg.test(hex.charAt(i)))
				{
					nhex += hex.charAt(i);
				}
				else
				{
					nhex += 0;
				}
			}
			hex = nhex;
			var rgb = hex2rgb(hex);
			var hsv = hex2hsv(hex);
		}
		this.current = [noNaN(parseInt(hsv[0])), noNaN(parseInt(hsv[1])), noNaN(parseInt(hsv[2]))];
		this.h.find('.current').css('background', '#'+hex);
		this.t.next().css('background', '#'+hex);
		this.h.find('.sat_val').css('background-color', '#'+hsv2hex([hsv[0], 100, 100]));
		if(noUpdate!='hex')
		{
			this.t.val('#'+hex).change();
		}
		if(noUpdate!='rgb')
		{
			var rgbinputs = this.h.find('.values');
			rgbinputs.children('input.r').val(rgb[0]);
			rgbinputs.children('input.g').val(rgb[1]);
			rgbinputs.children('input.b').val(rgb[2]);
		}
		if(noUpdate!='hsv')
		{
			this.h.find('.sat_val .cursor').css({
				'left': (hsv[1]*2.56*this.pickerSize)+'px',
				'top': ((100-hsv[2])*2.56*this.pickerSize)+'px'
			});
			if(hsv[0]==0)
			{
				hsv[0] = 360;
			}
			this.h.find('.hue .cursor').css({
				'top': ((360-hsv[0])/360*256*this.pickerSize)+'px'
			});
		}
		if(!noSubmit)
		{
			this.oldColor = this.current;
			this.h.find('.old').css('background', '#'+hex);
		}
		return this;
	};
	this.getColor = function(model){
		if(model=='rgb')
		{
			return hsv2rgb(this.current);
		}
		else if(model=='hsv')
		{
			return this.current;
		}
		else
		{
			return hsv2hex(this.current);
		}
	};
	this.show = function(){
		this.h.css({'top': (this.t.position().top+this.t.outerHeight(true))+'px', 'left': this.t.position().left+'px'}).slideDown();
		$(document.body).bind('mousedown'+this.namespace, {'th': this}, function(e){
			th = e.data.th;
			if(!th.h.has(e.target).length && !th.h.is(e.target) && !th.t.is(e.target) && !th.t.next().is(e.target))
			{
				th.hide();
			}
		});
		return this;
	};
	this.hide = function(submit){
		if(this.h.is(':hidden'))
		{
			this.h.hide();
		}
		else
		{
			this.h.slideUp();
		}
		$(document.body).unbind('mousedown'+this.namespace);
		if(submit===false)
		{
			this.setColor(this.oldColor, 'hsv', '', true);
		}
		else
		{
			this.oldColor = this.current;
			this.h.find('.old').css('background', '#'+hsv2hex(this.current));
		}
		return this;
	};
	this.updateSatVal = function(e){
		var sat = Math.max(1, Math.min(parseInt((e.pageX-this.h.find('.sat_val').offset().left)/this.pickerSize, 10), 256))-1;
		var val = Math.max(1, Math.min(parseInt((e.pageY-this.h.find('.sat_val').offset().top)/this.pickerSize, 10), 256))-1;
		this.h.find('.sat_val .cursor').css({
			'left': (sat*this.pickerSize)+'px',
			'top': (val*this.pickerSize)+'px'
		});
		this.setColor([this.getColor('hsv')[0], sat/2.55, (100-val/2.55)], 'hsv', 'hsv', true);
		return this;
	};
	this.endUpdateSatVal = function(e){
		t = e.data.th;
		$(document).unbind('mousemove'+t.namespace);
		$(document).unbind('mouseup'+t.namespace);
		return this;
	};
	this.updateHue = function(e){
		var hue = Math.max(1, Math.min(parseInt((e.pageY-this.h.find('.hue').offset().top)/this.pickerSize, 10), 256))-1;
		var sat_val = this.getColor('hsv');
		this.h.find('.hue .cursor').css({
			'top': (hue*this.pickerSize)+'px'
		});
		this.setColor([(256-hue)*360/256, sat_val[1], sat_val[2]], 'hsv', 'hsv', true);
		return this;
	};
	this.endUpdateHue = function(e){
		t = e.data.th;
		$(document).unbind('mousemove'+t.namespace);
		$(document).unbind('mouseup'+t.namespace);
		return this;
	};
	this.updateRGB = function(correct){
		var rgb = [this.h.find('.values input.r').val(), this.h.find('.values input.g').val(), this.h.find('.values input.b').val()];
		noUpdate = 'rgb';
		if(correct)
		{
			noUpdate = '';
		}
		this.setColor(rgb, 'rgb', noUpdate, true);
	};
	this.updateHEX = function(correct){
		noUpdate = 'hex';
		if(correct)
		{
			noUpdate = '';
		}
		this.setColor(this.t.val(), 'hex', noUpdate, true);
	};
	this.pickerSize = 0.625;
	this.current = [0, 0, 0];
	this.oldColor = [0, 0, 0];
	this.namespace = '.jancolor_'+Math.floor((Math.random()*10000000000));
	this.t = t;
	this.t.after(
 '<div class="jancolorPreview"></div>'
+'<div class="jancolorW">'
+'	<div class="sat_val"><div class="cursor"></div></div>'
+'	<div class="hue"><div class="cursor"></div></div>'
+'  <div class="options">'
+'		<div class="preview">'
+'			<div class="current"></div>'
+'			<div class="old"></div>'
+'		</div>'
+'		<div class="values">'
+'			<label>R</label><input type="text" class="r" value="" /><br />'
+'			<label>G</label><input type="text" class="g" value="" /><br />'
+'			<label>B</label><input type="text" class="b" value="" /><br />'
+'		</div>'
+'	</div>'
+'	<div class="buttons">'
+'		<button type="button" class="ok">OK</button>'
+'		<button type="button" class="cancel">Cancel</button>'
+'	</div>'
+'</div>');
	this.t.next().borderRadius(3).boxShadow('#000000', 0, 2, 0.3, 'outset', 0, 0);
	this.h = this.t.next().next().unSelectable().css({'display': 'none'});
	this.hide();
	this.t.add(this.t.next()).bind('click'+this.namespace, {th: this}, function(e){
		th = e.data.th;
		th.show();
	});
	this.h.borderRadius(7).boxShadow('#000000', 0, 4, 0.2, 'outset', 0, 0);
	this.h.find(".preview, button").borderRadius(3);
	this.h.find(".cancel").bind('click'+this.namespace, {th: this}, function(e){
		th = e.data.th;
		th.hide(false);
	});
	this.h.find(".ok").bind('click'+this.namespace, {th: this}, function(e){
		th = e.data.th;
		th.hide();
	});
	this.h.find('.sat_val').bind('mousedown'+this.namespace, {th: this}, function(e){
		th = e.data.th;
		th.updateSatVal(e);
		$(document).bind('mousemove'+th.namespace, {'th': th}, function(e){
			e.data.th.updateSatVal(e);
		});
		$(document).bind('mouseup'+th.namespace, {'th': th}, function(e){
			e.data.th.endUpdateSatVal(e);
		});
	});
	this.h.find('.hue').bind('mousedown'+this.namespace, {th: this}, function(e){
		th = e.data.th;
		th.updateHue(e);
		$(document).bind('mousemove'+th.namespace, {'th': th}, function(e){
			e.data.th.updateHue(e);
		});
		$(document).bind('mouseup'+th.namespace, {'th': th}, function(e){
			e.data.th.endUpdateHue(e);
		});
	});
	this.h.find('.values input').bind('keyup'+this.namespace+' change'+this.namespace, {th: this, correct: false}, function(e){
		e.data.th.updateRGB(e.data.correct);
	});
	this.h.find('.values input').bind('blur'+this.namespace, {th: this, correct: true}, function(e){
		e.data.th.updateRGB(e.data.correct);
	});
	this.t.bind('keyup'+this.namespace+' change'+this.namespace, {th: this, correct: false}, function(e){
		e.data.th.updateHEX(e.data.correct);
	});
	this.t.bind('blur'+this.namespace, {th: this, correct: true}, function(e){
		e.data.th.updateHEX(e.data.correct);
	});
	return this;
}
function noNaN(a,b){if(!b){b=0}if(isNaN(a)){return b}else{return a}}function rgb2hex(a){a[0]=noNaN(a[0]);a[1]=noNaN(a[1]);a[2]=noNaN(a[2]);var b=Math.min(255,Math.max(0,a[0]));var c=Math.min(255,Math.max(0,a[1]));var d=Math.min(255,Math.max(0,a[2]));var e=n2hex(b)+n2hex(c)+n2hex(d);return e}function n2hex(a){a=parseInt(a);if(isNaN(a)){return"00"}a=Math.min(255,Math.max(0,a));hex="0123456789ABCDEF";return hex.charAt((a-a%16)/16)+hex.charAt(a%16)}function hex2rgb(a){if(a.charAt(0)=="#"){a=a.substr(1,6)}if(a.length==3){a=""+a.charAt(0)+a.charAt(0)+a.charAt(1)+a.charAt(1)+a.charAt(2)+a.charAt(2)}a=a.substr(0,6);var b=parseInt(a.substr(0,2),16);var c=parseInt(a.substr(2,2),16);var d=parseInt(a.substr(4,2),16);b=noNaN(b);c=noNaN(c);d=noNaN(d);var e=new Array(b,c,d);return e}function hsv2rgb(a){a[0]=noNaN(a[0]);a[1]=noNaN(a[1]);a[2]=noNaN(a[2]);var b=Math.min(360,Math.max(0,a[0]))/360;var c=Math.min(255,Math.max(0,a[1]))/100;var d=Math.min(255,Math.max(0,a[2]))/100;if(c>0){if(b>=1){b=0}b=b*6;var e=b-Math.floor(b);var f=d*(1-c);var h=d*(1-c*e);var i=d*(1-c*(1-e));switch(Math.floor(b)){case 0:r=d;g=i;h=f;break;case 1:r=h;g=d;h=f;break;case 2:r=f;g=d;h=i;break;case 3:r=f;g=h;h=d;break;case 4:r=i;g=f;h=d;break;case 5:r=d;g=f;h=h;break}var j=new Array(Math.round(r*255),Math.round(g*255),Math.round(h*255));return j}else{var j=new Array(Math.round(d*255),Math.round(d*255),Math.round(d*255));return j}}function rgb2hsv(a){a[0]=noNaN(a[0]);a[1]=noNaN(a[1]);a[2]=noNaN(a[2]);var b=Math.min(255,Math.max(0,a[0]))/255;var c=Math.min(255,Math.max(0,a[1]))/255;var d=Math.min(255,Math.max(0,a[2]))/255;var e=Math.min(b,c,d);var f=Math.max(b,c,d);var g=f-e;var h=f;var i,j;if(g==0){i=0;j=0}else{j=g/f;var k=((f-b)/6+g/2)/g;var l=((f-c)/6+g/2)/g;var m=((f-d)/6+g/2)/g;if(b==f){i=m-l}else if(c==f){i=1/3+k-m}else if(d==f){i=2/3+l-k}if(i<0){i+=1}else if(i>1){i-=1}}var n=new Array(i*360,j*100,h*100);return n}function hex2hsv(a){return rgb2hsv(hex2rgb(a))}function hsv2hex(a){return rgb2hex(hsv2rgb(a))}
