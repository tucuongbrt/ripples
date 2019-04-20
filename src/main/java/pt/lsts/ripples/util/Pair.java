/*
 * Copyright (c) 2004-2019 Universidade do Porto - Faculdade de Engenharia
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
 * Modified European Union Public Licence - EUPL v.1.1 Usage
 * Alternatively, this file may be used under the terms of the Modified EUPL,
 * Version 1.1 only (the "Licence"), appearing in the file LICENSE.md
 * included in the packaging of this file. You may not use this work
 * except in compliance with the Licence. Unless required by applicable
 * law or agreed to in writing, software distributed under the Licence is
 * distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the Licence for the specific
 * language governing permissions and limitations at
 * https://github.com/LSTS/neptus/blob/develop/LICENSE.md
 * and http://ec.europa.eu/idabc/eupl.html.
 *
 * For more information please see <http://lsts.fe.up.pt/neptus>.
 *
 * Copied from https://github.com/LSTS/neptus/blob/develop/src/pt/lsts/neptus/data/Pair.java
 * Author: zp
 * Author: Renato Campos
 * 8 February, 2019
 */
package pt.lsts.ripples.util;

import java.io.Serializable;
import com.eclipsesource.json.JsonObject;

public class Pair<First, Second> implements Serializable{

    private static final long serialVersionUID = -5438676308465412501L;
    First first;
    Second second;
    
    public Pair(First first, Second second) {
        this.first = first;
        this.second = second;
    }
    
    public First getFirst() {
        return first;
    }
    
    public Second getSecond() {
        return second;
    }
    
    @Override
    public String toString() {
        JsonObject json = new JsonObject();

		json.add("first", first.toString());
		json.add("second", second.toString());

		return json.toString();
    }
    
    @Override
    public boolean equals(Object obj) {
        return hashCode() == obj.hashCode();
    }
    
    @Override
    public int hashCode() {
        return (first.hashCode()+"_"+second.hashCode()).hashCode();        
    }
}