/*
 * Copyright (c) 2004-2014 Universidade do Porto - Faculdade de Engenharia
 * Laboratório de Sistemas e Tecnologia Subaquática (LSTS)
 * All rights reserved.
 * Rua Dr. Roberto Frias s/n, sala I203, 4200-465 Porto, Portugal
 *
 * This file is part of Neptus, Command and Control Framework.
 *
 * Commercial Licence Usage
 * Licencees holding valid commercial Neptus licences may use this file
 * in accordance with the commercial licence agreement provided with the
 * Software or, alternatively, in accordance with the terms contained in a
 * written agreement between you and Universidade do Porto. For licensing
 * terms, conditions, and further information contact lsts@fe.up.pt.
 *
 * European Union Public Licence - EUPL v.1.1 Usage
 * Alternatively, this file may be used under the terms of the EUPL,
 * Version 1.1 only (the "Licence"), appearing in the file LICENSE.md
 * included in the packaging of this file. You may not use this work
 * except in compliance with the Licence. Unless required by applicable
 * law or agreed to in writing, software distributed under the Licence is
 * distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the Licence for the specific
 * language governing permissions and limitations at
 * https://www.lsts.pt/neptus/licence.
 *
 * For more information please see <http://lsts.fe.up.pt/neptus>.
 *
 * Author: zp
 * Jun 28, 2013
 */
package pt.lsts.ripples.iridium;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashMap;

import javax.xml.bind.annotation.adapters.HexBinaryAdapter;

import pt.lsts.imc.IMCDefinition;
import pt.lsts.imc.IMCInputStream;
import pt.lsts.imc.IMCMessage;
import pt.lsts.imc.IMCOutputStream;

/**
 * @author zp
 */
public abstract class IridiumMessage implements Comparable<IridiumMessage> {

    public static final int TYPE_DEVICE_UPDATE = 2001;
    public static final int TYPE_ACTIVATE_SUBSCRIPTION = 2003;
    public static final int TYPE_DEACTIVATE_SUBSCRIPTION = 2004;
    public static final int TYPE_IRIDIUM_COMMAND = 2005;
    public static final int TYPE_DESIRED_ASSET_POSITION = 2006;
    public static final int TYPE_TARGET_ASSET_POSITION = 2007;
    public static final int TYPE_IMC_IRIDIUM_MESSAGE = 2010;
    public static final int TYPE_EXTENDED_DEVICE_UPDATE = 2011;
    public static final int TYPE_PLAIN_TEXT = -1;
    private static final HexBinaryAdapter hexAdapter = new HexBinaryAdapter();
    private static LinkedHashMap<Integer, Class<? extends IridiumMessage>> iridiumTypes = new LinkedHashMap<>();

    static {
        iridiumTypes.put(2001, DeviceUpdate.class);
        iridiumTypes.put(2003, ActivateSubscription.class);
        iridiumTypes.put(2004, DeactivateSubscription.class);
        iridiumTypes.put(2005, IridiumCommand.class);
        iridiumTypes.put(2006, DesiredAssetPosition.class);
        iridiumTypes.put(2007, TargetAssetPosition.class);
        iridiumTypes.put(2010, ImcIridiumMessage.class);
        iridiumTypes.put(2011, ExtendedDeviceUpdate.class);
    }

    public int source, destination, message_type;
    public long timestampMillis = System.currentTimeMillis();

    public IridiumMessage(int msgType) {
        this.message_type = msgType;
    }

    public static IridiumMessage deserialize(byte[] data) throws Exception {
        IMCInputStream iis = new IMCInputStream(new ByteArrayInputStream(data), IMCDefinition.getInstance());
        iis.setBigEndian(false);
        iis.mark(10);
        int source = iis.readUnsignedShort();
        int dest = iis.readUnsignedShort();
        int mgid = iis.readUnsignedShort();
        IridiumMessage m;
        if (iridiumTypes.containsKey(mgid)) {
            m = iridiumTypes.get(mgid).getDeclaredConstructor().newInstance();
        } else {
            mgid = -1;
            iis.reset();
            m = PlainTextMessage.createTextMessageFrom(iis);
        }

        if (m != null) {
            m.setSource(mgid > -1 ? source : 0xFFFF);
            m.setDestination(mgid > -1 ? dest : 0xFFFF);
            m.setMessageType(mgid);
            if (mgid > -1)
                m.deserializeFields(iis);
        }
        iis.close();

        return m;
    }

    public abstract int serializeFields(IMCOutputStream out) throws Exception;

    public abstract int deserializeFields(IMCInputStream in) throws Exception;

    public abstract Collection<IMCMessage> asImc();

    public byte[] serialize() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        IMCOutputStream ios = new IMCOutputStream(baos);
        ios.setBigEndian(false);
        int size = 6;
        ios.writeUnsignedShort(source);
        ios.writeUnsignedShort(destination);
        ios.writeUnsignedShort(message_type);
        size += serializeFields(ios);
        return Arrays.copyOf(baos.toByteArray(), size);
    }

    /**
     * @return the source
     */
    public final int getSource() {
        return source;
    }

    /**
     * @param source the source to set
     */
    public final void setSource(int source) {
        this.source = source;
    }

    /**
     * @return the destination
     */
    public final int getDestination() {
        return destination;
    }

    /**
     * @param destination the destination to set
     */
    public final void setDestination(int destination) {
        this.destination = destination;
    }

    /**
     * @return the message_type
     */
    public final int getMessageType() {
        return message_type;
    }

    /**
     * @param message_type the message_type to set
     */
    public final void setMessageType(int message_type) {
        this.message_type = message_type;
    }

    @Override
    public String toString() {
        try {
            return hexAdapter.marshal(serialize()).replaceAll("\"", "");
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    @Override
    public int compareTo(IridiumMessage o) {
        return (int) (timestampMillis - o.timestampMillis);
    }
}
