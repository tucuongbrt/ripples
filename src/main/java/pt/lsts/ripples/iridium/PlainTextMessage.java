package pt.lsts.ripples.iridium;

import pt.lsts.imc.*;
import pt.lsts.ripples.domain.shared.AssetPosition;

import java.util.Collection;
import java.util.Vector;

public class PlainTextMessage extends IridiumMessage {
    String text;
    AssetPosition position;

    public PlainTextMessage() {
        super(-1);
    }

    @Override
    public int serializeFields(IMCOutputStream out) throws Exception {
        out.write(text.getBytes("ISO-8859-1"));
        out.close();
        return text.getBytes("ISO-8859-1").length;
    }

    @Override
    public int deserializeFields(IMCInputStream in) throws Exception {
        int bav = in.available();
        bav = bav < 0 ? 0 : bav;
        byte[] data = new byte[bav];
        int len = in.read(data);
        text = new String(data, "ISO-8859-1");
        return len;
    }

    @Override
    public Collection<IMCMessage> asImc() {
        Vector<IMCMessage> msgs = new Vector<>();
        msgs.add(new TextMessage("iridium", text));
        return msgs;
    }

    @Override
    public String toString() {
        return "Text: " + text + "\n";
    }
}
