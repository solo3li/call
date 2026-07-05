using Microsoft.AspNetCore.Mvc;
using FoodRMS.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Threading.Tasks;

namespace FoodRMS.Api.Controllers
{
    [ApiController]
    [Route("api/internal/asterisk")]
    public class InternalAsteriskController : ControllerBase
    {
        private readonly FoodRMSDbContext _context;

        public InternalAsteriskController(FoodRMSDbContext context)
        {
            _context = context;
        }

        [HttpGet("config")]
        public async Task<IActionResult> GetConfig()
        {
            var sipSettings = await _context.TenantSipSettings.ToListAsync();
            
            var sipConf = new StringBuilder();
            var extenConf = new StringBuilder();

            sipConf.AppendLine("[general]");
            sipConf.AppendLine("bindport=5060");
            sipConf.AppendLine("bindaddr=0.0.0.0");
            sipConf.AppendLine("tcpenable=yes");
            sipConf.AppendLine("transport=udp,tcp");
            sipConf.AppendLine("tcpbindaddr=0.0.0.0:5060");
            sipConf.AppendLine("context=from-internal");
            sipConf.AppendLine("nat=force_rport,comedia");
            sipConf.AppendLine("directmedia=no");
            sipConf.AppendLine("disallow=all");
            sipConf.AppendLine("allow=ulaw");
            sipConf.AppendLine("allow=alaw");
            sipConf.AppendLine("");

            // Add static LiveKit
            sipConf.AppendLine("[livekit]");
            sipConf.AppendLine("type=friend");
            sipConf.AppendLine("context=from-internal");
            sipConf.AppendLine("host=127.0.0.1"); // Point to localhost to avoid NAT loopback for RTP
            sipConf.AppendLine("port=5061");
            sipConf.AppendLine("directmedia=no");
            sipConf.AppendLine("insecure=port,invite");
            sipConf.AppendLine("disallow=all");
            sipConf.AppendLine("allow=ulaw");
            sipConf.AppendLine("allow=alaw");
            sipConf.AppendLine("");

            // Add static Tester Account for Clients
            sipConf.AppendLine("[999]");
            sipConf.AppendLine("type=friend");
            sipConf.AppendLine("context=from-internal");
            sipConf.AppendLine("host=dynamic");
            sipConf.AppendLine("secret=tester123");
            sipConf.AppendLine("nat=force_rport,comedia");
            sipConf.AppendLine("directmedia=no");
            sipConf.AppendLine("disallow=all");
            sipConf.AppendLine("allow=ulaw");
            sipConf.AppendLine("allow=alaw");
            sipConf.AppendLine("");

            extenConf.AppendLine("[general]");
            extenConf.AppendLine("static=yes");
            extenConf.AppendLine("writeprotect=no");
            extenConf.AppendLine("");
            extenConf.AppendLine("[from-internal]");
            extenConf.AppendLine("; ===== AI Agent (200) =====");
            extenConf.AppendLine("exten => 200,1,Answer()");
            extenConf.AppendLine("same  => n,Set(CALLTIME=${STRFTIME(${EPOCH},,%Y%m%d_%H%M%S)})");
            extenConf.AppendLine("same  => n,Set(CALLFILE=/var/spool/asterisk/monitor/${CALLTIME}_${CALLERID(num)}_ai.wav)");
            extenConf.AppendLine("same  => n,MixMonitor(${CALLFILE})");
            extenConf.AppendLine("same  => n,Dial(SIP/livekit/200,60)");
            extenConf.AppendLine("same  => n,Hangup()");
            extenConf.AppendLine("");
            extenConf.AppendLine("; ===== Post-Call Upload for AI =====");
            extenConf.AppendLine("exten => h,1,NoOp(Uploading AI recording)");
            extenConf.AppendLine("same  => n,System(sleep 1 && curl -s -X POST \"http://backend:5109/api/internal/asterisk/upload-recording?caller=${CALLERID(num)}&ai=1\" -F \"file=@${CALLFILE}\" &)");
            extenConf.AppendLine("");

            foreach(var s in sipSettings)
            {
                if(!string.IsNullOrEmpty(s.AgentExtension) && !string.IsNullOrEmpty(s.AgentPassword))
                {
                    sipConf.AppendLine($"[{s.AgentExtension}]");
                    sipConf.AppendLine("type=friend");
                    sipConf.AppendLine("context=from-internal");
                    sipConf.AppendLine("host=dynamic");
                    sipConf.AppendLine($"secret={s.AgentPassword}");
                    sipConf.AppendLine("disallow=all");
                    sipConf.AppendLine("allow=ulaw");
                    sipConf.AppendLine("allow=alaw");
                    sipConf.AppendLine("");

                    extenConf.AppendLine($"; ===== Agent Ext {s.AgentExtension} =====");
                    extenConf.AppendLine($"exten => {s.AgentExtension},1,Answer()");
                    extenConf.AppendLine($"same  => n,Set(CALLTIME_H=${{STRFTIME(${{EPOCH}},,%Y%m%d_%H%M%S)}})");
                    extenConf.AppendLine($"same  => n,Set(CALLFILE_H=/var/spool/asterisk/monitor/${{CALLTIME_H}}_${{CALLERID(num)}}_human.wav)");
                    extenConf.AppendLine($"same  => n,MixMonitor(${{CALLFILE_H}})");
                    extenConf.AppendLine($"same  => n,Dial(SIP/{s.AgentExtension},30)");
                    extenConf.AppendLine($"same  => n,Hangup()");
                    extenConf.AppendLine($"exten => h,1,System(sleep 1 && curl -s -X POST \"http://backend:5109/api/internal/asterisk/upload-recording?caller=${{CALLERID(num)}}&ai=0\" -F \"file=@${{CALLFILE_H}}\" &)");
                    extenConf.AppendLine("");

                    if (!string.IsNullOrEmpty(s.DidNumber))
                    {
                        extenConf.AppendLine($"; Inbound from DID {s.DidNumber} -> AI Agent");
                        extenConf.AppendLine($"exten => {s.DidNumber},1,Answer()");
                        extenConf.AppendLine($"same  => n,Set(CALLTIME_D=${{STRFTIME(${{EPOCH}},,%Y%m%d_%H%M%S)}})");
                        extenConf.AppendLine($"same  => n,Set(CALLFILE_D=/var/spool/asterisk/monitor/${{CALLTIME_D}}_${{CALLERID(num)}}_ai_did.wav)");
                        extenConf.AppendLine($"same  => n,MixMonitor(${{CALLFILE_D}})");
                        extenConf.AppendLine($"same  => n,Dial(SIP/livekit/t_{s.AgentExtension},60)");
                        extenConf.AppendLine($"same  => n,Hangup()");
                        extenConf.AppendLine($"exten => h,1,System(sleep 1 && curl -s -X POST \"http://backend:5109/api/internal/asterisk/upload-recording?caller=${{CALLERID(num)}}&ai=1\" -F \"file=@${{CALLFILE_D}}\" &)");
                        extenConf.AppendLine("");
                    }
                }
            }

            return Ok(new {
                sipConf = sipConf.ToString(),
                extenConf = extenConf.ToString()
            });
        }
    }
}
