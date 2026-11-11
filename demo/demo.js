(function(){
  'use strict';
  var input=document.getElementById('vast'), load=document.getElementById('load'), clear=document.getElementById('clear'), status=document.getElementById('status'), log=document.getElementById('events');
  var player=window.videojs('mediarazzi_player',{fluid:true,autoplay:false,preload:'none'});
  var connection=null;
  function append(message){ if(log.children.length===1&&log.firstElementChild.textContent==='Ready to test your first VAST tag.')log.replaceChildren();var item=document.createElement('li');item.textContent=new Date().toLocaleTimeString()+' · '+message;log.prepend(item);}
  function setStatus(message){status.textContent=message;}
  load.addEventListener('click',function(){
    try{
      var tag=window.MediarazziVast.validateTagUrl(input.value);
      if(connection){connection.dispose();connection=null;}
      // videojs-ima does not support replacing an active AdsManager in-place reliably.
      // Discard the old player before configuring a new ad request.
      player.dispose();
      var holder=document.querySelector('.player');
      holder.replaceChildren();
      var video=document.createElement('video');video.id='mediarazzi_player';video.className='video-js vjs-default-skin vjs-big-play-centered';video.setAttribute('controls','');video.setAttribute('playsinline','');
      var source=document.createElement('source');source.src='https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';source.type='video/mp4';video.append(source);holder.append(video);
      player=window.videojs(video,{fluid:true,autoplay:false,preload:'none'});
      connection=window.MediarazziVast.connect(player,{adTagUrl:tag,onEvent:function(event){
        var info=event.details&&event.details.message?' · '+event.details.message:'';
        append(event.type+info);
        if(event.type==='ads-ad-started')setStatus('Advertisement started');
        else if(event.type==='adserror'||event.type==='error')setStatus('Player reported an error');
        else if(event.type==='adend'||event.type==='contentresumed')setStatus('Content playing / resumed');
      }});
      setStatus('Requesting ad');
      connection.initializeOnUserGesture();
      var result=player.play();if(result&&typeof result.catch==='function')result.catch(function(err){append('Playback blocked: '+err.message);setStatus('Click Play in player');});
    }catch(err){append('Setup error: '+err.message);setStatus('Setup error');}
  });
  clear.addEventListener('click',function(){log.replaceChildren();setStatus('Ready');});
})();
