package pt.lsts.ripples.util;

import pt.lsts.imc.IMCDefinition;

public class SystemType {
    public static String getSystemType(long imcId) {
        int sys_selector = 0xE000;
        int vtype_selector = 0x1C00;

        int sys_type = (int) ((imcId & sys_selector) >> 13);

        switch (sys_type) {
            case 0:
            case 1:
                switch ((int) ((imcId & vtype_selector) >> 10)) {
                    case 0:
                        return "UUV";
                    case 1:
                        return "ROV";
                    case 2:
                        return "USV";
                    case 3:
                        return "UAV";
                    default:
                        return "UXV";
                }
            case 2:
                return "CCU";
            default:
                break;
        }

        if (imcId > Integer.MAX_VALUE)
            return "Unknown";
        String name = IMCDefinition.getInstance().getResolver().resolve((int) imcId).toLowerCase();
        if (name.contains("ccu"))
            return "CCU";
        if (name.contains("argos"))
            return "Argos Tag";
        if (name.contains("spot"))
            return "SPOT Tag";
        if (name.contains("manta"))
            return "Gateway";
        return "Unknown";
    }
}
