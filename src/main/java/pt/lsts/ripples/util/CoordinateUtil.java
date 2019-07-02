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
 * Version 1.1 only (the "Licence"), appearing in the file LICENCE.md
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
 * Author: Zé Pinto, Paulo Dias
 * 2005/01/15
 * Adpated by Renato Campos
 * 2019/02/08
 */

package pt.lsts.ripples.util;

import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.StringTokenizer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import pt.lsts.ripples.util.LocationType;

/**
 * @author Zé Pinto
 * @author Paulo Dias
 * @author Sergio Fraga
 * @author Rui Gomes
 */
public class CoordinateUtil {

    public static final char CHAR_DEGREE = '\u00B0'; // º Unicode

    public final static float MINUTE = 1 / 60.0f;
    public final static double MINUTE_D = 1 / 60.0d;
    public final static float SECOND = 1 / 3600.0f;
    public final static double SECOND_D = 1 / 3600.0d;

    public static final double c_wgs84_a = 6378137.0;
    public static final double c_wgs84_e2 = 0.00669437999013;
    public static final double c_wgs84_f = 0.0033528106647475;

    private final static String DELIM = "NnSsEeWwº'\": \t\n\r\f\u00B0";
    
    public final static NumberFormat heading3DigitsFormat = new DecimalFormat("000");

    private static final int DEFAULT_DHOUSES_FOR_DMS = 2;
    private static final int DEFAULT_DHOUSES_FOR_DM  = 4;
    
    private final static Logger logger = LoggerFactory.getLogger(CoordinateUtil.class);

    /**
     * @param coord Is expeted to be in the form of:
     * 
     *            <pre>
     * "[NSEW]ddd mm' ss.sss''", "ddd[NSEW]mm ss.sss"
     * </pre>
     * 
     *            Examples: "N41 36' 3.333''", "41N36 3.333", "N41 36' 3,333''", "41N36.21"
     * @return Is null if some error occurs or an StringArray in the form of {"N", "0", "0", "0"} (all elements will allways exist).
     */
    public static String[] parseCoordToStringArray(String coord) {
        String[] result = { "N", "0", "0", "0" }; // new String[4];
        StringTokenizer strt;

        if (coord == null)
            return null;

        coord = coord.replace(',', '.');

        if (coord.toUpperCase().indexOf('N') != -1)
            result[0] = "N";
        else if (coord.toUpperCase().indexOf('S') != -1)
            result[0] = "S";
        else if (coord.toUpperCase().indexOf('E') != -1)
            result[0] = "E";
        else if (coord.toUpperCase().indexOf('W') != -1)
            result[0] = "W";
        else
            return null;

        strt = new StringTokenizer(coord, DELIM);
        // NeptusLog.pub().info(strt.countTokens());
        if ((strt.countTokens() < 1) || (strt.countTokens() > 3))
            return null;
        for (int i = 1; strt.hasMoreTokens(); i++) {
            // NeptusLog.pub().info(strt.nextToken());
            result[i] = strt.nextToken();
            // Tries to see if the value is a valid double number
            try {
                Double.parseDouble(result[i]);
            }
            catch (NumberFormatException e) {
                return null;
            }
        }

        return result;
    }

    /**
     * @see #parseCoordToStringArray(String)
     * @param coord
     * @return
     */
    public static String[] parseLatitudeCoordToStringArray(String coord) {
        String[] result = parseCoordToStringArray(coord);

        if (result == null)
            return null;

        else if (result[0].equalsIgnoreCase("N"))
            return result;
        else if (result[0].equalsIgnoreCase("S"))
            return result;

        return null;
    }

    /**
     * @see #parseCoordToStringArray(String)
     * @param coord
     * @return
     */
    public static String[] parseLongitudeCoordToStringArray(String coord) {
        String[] result = parseCoordToStringArray(coord);
        if (result == null)
            return null;
        else if (result[0].equalsIgnoreCase("E"))
            return result;
        else if (result[0].equalsIgnoreCase("W"))
            return result;

        return null;
    }

    /**
     * @see #parseCoordToStringArray(String)
     * @param coord
     * @return
     */
    public static double parseLatitudeCoordToDoubleValue(String coord) {
        
        try { return Double.parseDouble(coord); }
        catch (Exception e){ }
        
        double result = Double.NaN;
        String[] latStr = parseLatitudeCoordToStringArray(coord);
        if (latStr == null)
            return Double.NaN;

        double latD = Double.NaN;
        double latM = Double.NaN;
        double latS = Double.NaN;
        try {
            latD = Double.parseDouble(latStr[1]);
            latM = Double.parseDouble(latStr[2]);
            latS = Double.parseDouble(latStr[3]);
        }
        catch (NumberFormatException e) {
            e.printStackTrace();
        }

        double latDouble = latD;
        latDouble += latM * MINUTE_D;
        latDouble += latS * SECOND_D;

        if (!latStr[0].equalsIgnoreCase("N"))
            latDouble = -latDouble;
        while (latDouble > 90)
            latDouble -= 180d;
        while (latDouble < -90)
            latDouble += 180d;

        result = latDouble;
        return result;
    }

    /**
     * @see #parseCoordToStringArray(String)
     * @param coord
     * @return
     */
    public static double parseLongitudeCoordToDoubleValue(String coord) {
       
        try { return Double.parseDouble(coord); }
        catch (Exception e){ }
        
        double result = Double.NaN;
        String[] lonStr = parseLongitudeCoordToStringArray(coord);
        if (lonStr == null)
            return Double.NaN;

        double lonD = Double.NaN;
        double lonM = Double.NaN;
        double lonS = Double.NaN;
        try {
            lonD = Double.parseDouble(lonStr[1]);
            lonM = Double.parseDouble(lonStr[2]);
            lonS = Double.parseDouble(lonStr[3]);
        }
        catch (NumberFormatException e) {
            e.printStackTrace();
        }

        double lonDouble = lonD;
        lonDouble += lonM * MINUTE_D;
        lonDouble += lonS * SECOND_D;

        if (!lonStr[0].equalsIgnoreCase("E"))
            lonDouble = -lonDouble;
        while (lonDouble > 180)
            lonDouble -= 360d;
        while (lonDouble < -180)
            lonDouble += 360d;

        result = lonDouble;
        return result;
    }

    /**
     * 
     * @param latitude
     * @return
     */
    public static double[] parseLatitudeStringToDMS(String latitude) {
        double[] dms = new double[3];

        String[] latStr = parseLatitudeCoordToStringArray(latitude);
        // if (la)
        try {
            if (latStr[0].equalsIgnoreCase("S"))
                dms[0] = -Double.parseDouble(latStr[1]);
            else
                dms[0] = Double.parseDouble(latStr[1]);

            dms[1] = Double.parseDouble(latStr[2]);
            dms[2] = Double.parseDouble(latStr[3]);
        }
        catch (Exception e) {
            logger.error("parseLatitudeStringToDMS(String latitude)", e);
        }

        return dms;
    }

    /**
     * 
     * @param latRads
     * @return
     */
    public static double[] parseLongitudeStringToDMS(String longitude) {
        double[] dms = new double[3];

        String[] lonStr = parseLongitudeCoordToStringArray(longitude);

        try {
            if (lonStr[0].equalsIgnoreCase("W"))
                dms[0] = -Double.parseDouble(lonStr[1]);
            else
                dms[0] = Double.parseDouble(lonStr[1]);

            dms[1] = Double.parseDouble(lonStr[2]);
            dms[2] = Double.parseDouble(lonStr[3]);
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        return dms;
    }

    /**
     * @param degrees
     * @param minutes
     * @param seconds
     * @return
     */
    public static double dmsToDecimalDegrees(double degrees, double minutes, double seconds) {
        double signal = 1;

        while (degrees > 90)
            degrees -= 180;
        while (degrees < -90)
            degrees += 180.0;

        if (degrees < 0)
            signal = -1;

        return degrees + minutes * signal * MINUTE_D + seconds * signal * SECOND_D;
    }

    /**
     * @param degrees
     * @param minutes
     * @param seconds
     * @return Result as Degrees Minutes
     */
    public static double[] dmsToDm(double degrees, double minutes, double seconds) {
        while (degrees > 90)
            degrees -= 180;
        while (degrees < -90)
            degrees += 180.0;

        double res[] = new double[2];
        res[0] = degrees;
        res[1] = minutes + seconds * MINUTE_D;
        return res;
    }

    /**
     * @param decimalDegress
     * @return
     */
    public static double[] decimalDegreesToDMS(double decimalDegress) {
        double[] dms = new double[3];
        int multiplier = 1;

        if (decimalDegress < 0) {
            multiplier = -1;
            decimalDegress = -decimalDegress;
        }

        double remainder = decimalDegress - ((int) decimalDegress);

        dms[0] = (double) Math.floor((double) decimalDegress);

        dms[1] = (double) Math.floor((double) (remainder * 60.0d));

        remainder = remainder - (dms[1] / 60d);

        dms[2] = remainder * 3600d;

        dms[0] = multiplier * dms[0];

        return dms;
    }

    /**
     * @param decimalDegress
     * @return
     */
    public static double[] decimalDegreesToDM(double decimalDegress) {
        double[] dms = new double[3];
        double[] dm = new double[2];

        dms = decimalDegreesToDMS(decimalDegress);
        dm[0] = dms[0];
        dm[1] = dms[1] + dms[2] / 60d;
        return dm;
    }

    /**
     * @param dms
     * @param isLat
     * @return
     */
    private static String dmsToLatLonString(double[] dms, boolean isLat, int maxDecimalHouses) {
        return dmsToLatLonString(dms, isLat, false, maxDecimalHouses);
    }

    /**
     * @param dm
     * @param isLat
     * @return
     */
    private static String dmToLatLonString(double[] dm, boolean isLat, int maxDecimalHouses) {
        return dmsToLatLonString(dm, isLat, true, maxDecimalHouses);
    }

    /**
     * @param dms
     * @param isLat
     * @param dmonly
     * @param maxDecimalHouses if -1 it will not round the value.
     * @return
     */
    private static String dmsToLatLonString(double[] dms, boolean isLat, boolean dmonly, int maxDecimalHouses) {
        if (maxDecimalHouses < 0)
            maxDecimalHouses = dmonly ? DEFAULT_DHOUSES_FOR_DM : DEFAULT_DHOUSES_FOR_DMS;
        String l = "N";
        if (!isLat)
            l = "E";
        double d = dms[0];
        double m = dms[1];
        double s = 0d;
        if (!dmonly)
            s = dms[2];

        if ((d < 0 || "-0.0".equalsIgnoreCase("" + d)) && (Math.abs(d) + Math.abs(m) + Math.abs(s) != 0)) {
            l = "S";
            if (!isLat)
                l = "W";
            d = Math.abs(d);
        }

        NumberFormat nformat = DecimalFormat.getInstance(Locale.US);
        nformat.setMaximumFractionDigits(maxDecimalHouses);
        nformat.setMinimumFractionDigits(Math.min(3, maxDecimalHouses));
        nformat.setGroupingUsed(false);

        if (hasFracPart(d)) {
            nformat.setMaximumFractionDigits(maxDecimalHouses); // 8
            return nformat.format(d) + l;// +"0' 0''";
        }

        if (dmonly) {
            return new String((int) d + l + nformat.format(m));
        }

        if (hasFracPart(m)) {
            nformat.setMaximumFractionDigits(maxDecimalHouses); // 10
            return (int) Math.floor(d) + l + nformat.format(m);// +"' 0''";
        }

        nformat.setMaximumFractionDigits(maxDecimalHouses); // 8

        return new String((int) Math.floor(d) + l + (int) Math.floor(m) + "'" + nformat.format(s) + "''");
    }

    private static boolean hasFracPart(double num) {
        double intPart = Math.floor(num);
        return (num - intPart) > 0;
    }

    /**
     * @param dms
     * @return
     */
    public static String dmsToLatString(double[] dms) {
        return dmsToLatLonString(dms, true, DEFAULT_DHOUSES_FOR_DMS);
    }

    /**
     * @param dms
     * @param maxDecimalHouses
     * @return
     */
    public static String dmsToLatString(double[] dms, int maxDecimalHouses) {
        return dmsToLatLonString(dms, true, maxDecimalHouses);
    }

    /**
     * @param dm
     * @return
     */
    public static String dmToLatString(double[] dm) {
        return dmToLatLonString(dm, true, DEFAULT_DHOUSES_FOR_DM);
    }

    /**
     * @param dm
     * @param maxDecimalHouses
     * @return
     */
    public static String dmToLatString(double[] dm, int maxDecimalHouses) {
        return dmToLatLonString(dm, true, maxDecimalHouses);
    }

    /**
     * @param d
     * @param m
     * @param s
     * @return
     */
    public static String dmsToLatString(double d, double m, double s) {
        double[] dms = { d, m, s };
        return dmsToLatLonString(dms, true, DEFAULT_DHOUSES_FOR_DMS);
    }

    /**
     * @param d
     * @param m
     * @param s
     * @param maxDecimalHouses
     * @return
     */
    public static String dmsToLatString(double d, double m, double s, int maxDecimalHouses) {
        double[] dms = { d, m, s };
        return dmsToLatLonString(dms, true, maxDecimalHouses);
    }

    /**
     * @param d
     * @param m
     * @return
     */
    public static String dmToLatString(double d, double m) {
        double[] dm = { d, m };
        return dmToLatLonString(dm, true, DEFAULT_DHOUSES_FOR_DM);
    }

    /**
     * @param d
     * @param m
     * @param maxDecimalHouses
     * @return
     */
    public static String dmToLatString(double d, double m, int maxDecimalHouses) {
        double[] dm = { d, m };
        return dmToLatLonString(dm, true, maxDecimalHouses);
    }

    /**
     * @param dms
     * @return
     */
    public static String dmsToLonString(double[] dms) {
        return dmsToLatLonString(dms, false, DEFAULT_DHOUSES_FOR_DMS);
    }

    /**
     * @param dms
     * @param maxDecimalHouses
     * @return
     */
    public static String dmsToLonString(double[] dms, int maxDecimalHouses) {
        return dmsToLatLonString(dms, false, maxDecimalHouses);
    }

    /**
     * @param dm
     * @return
     */
    public static String dmToLonString(double[] dm) {
        return dmToLatLonString(dm, false, DEFAULT_DHOUSES_FOR_DM);
    }

    /**
     * @param dm
     * @param maxDecimalHouses
     * @return
     */
    public static String dmToLonString(double[] dm, int maxDecimalHouses) {
        return dmToLatLonString(dm, false, maxDecimalHouses);
    }

    /**
     * @param d
     * @param m
     * @param s
     * @return
     */
    public static String dmsToLonString(double d, double m, double s) {
        double[] dms = { d, m, s };
        return dmsToLatLonString(dms, false, DEFAULT_DHOUSES_FOR_DMS);
    }

    /**
     * @param d
     * @param m
     * @param s
     * @param maxDecimalHouses
     * @return
     */
    public static String dmsToLonString(double d, double m, double s, int maxDecimalHouses) {
        double[] dms = { d, m, s };
        return dmsToLatLonString(dms, false, maxDecimalHouses);
    }

    /**
     * @param d
     * @param m
     * @return
     */
    public static String dmToLonString(double d, double m) {
        double[] dm = { d, m };
        return dmToLatLonString(dm, false, DEFAULT_DHOUSES_FOR_DM);
    }

    /**
     * @param d
     * @param m
     * @param maxDecimalHouses
     * @return
     */
    public static String dmToLonString(double d, double m, int maxDecimalHouses) {
        double[] dm = { d, m };
        return dmToLatLonString(dm, false, maxDecimalHouses);
    }

    

    private static double latLonFrom83PFormatWorker(String latLonStr) {
        String[] parts = latLonStr.trim().split("[\\. ]");
        double sign = -1.0;
        if ("N".equalsIgnoreCase(parts[3].trim()) || "E".equalsIgnoreCase(parts[3].trim()))
            sign = 1.0;
        return sign * (Double.parseDouble(parts[0].trim()) + Double.parseDouble(parts[1].trim() + "." + parts[2].trim()) / 60d); 
    }

    public static double latFrom83PFormatWorker(String latStr) {
        return latLonFrom83PFormatWorker(latStr);
    }

    public static double lonFrom83PFormatWorker(String lonStr) {
        return latLonFrom83PFormatWorker(lonStr);
    }

    /**
     * Add an offset in meters(north, east) to a (lat,lon) in decimal degrees
     */
    public static double[] latLonAddNE2(double lat, double lon, double north, double east) {
        LocationType loc = new LocationType();
        loc.setLatitudeDegs(lat);
        loc.setLongitudeDegs(lon);
        return WGS84displace(lat, lon, 0, north, east, 0);
    }

    /**
     * Computes the offset (north, east) in meters from (lat, lon) to (alat, alon) [both of these in decimal degrees].<br>
     * Subtract the two latlons and come up with the distance in meters N/S and E/W between them.
     */
    public static double[] latLonDiff(double lat, double lon, double alat, double alon) {
        
        double[] ret = WGS84displacement(lat, lon, 0, alat, alon, 0);
        return new double[] { ret[0], ret[1] };
    }

    /**
     * Changes a 3D point in the vehicle body reference frame to the inertial reference frame.
     * 
     * @param (x,y,z) are the point coodinates and (phi[rad],theta[rad],psi[rad]) represent the orientation on each axis from one reference frame to the other.
     *        Examples: If (1,1,1) is the point in one body frame and (0,0,pi/2) is the orientation of the body frame with respect to the the inertial frame,
     *        the same point in the inertial frame becomes (-1,1,1)
     * 
     * @return Is null a DoubleArray in the form of {x, y, z} which is the point in the inertial coordinates
     */
    public static double[] bodyFrameToInertialFrame(double x, double y, double z, double phi, double theta, double psi) {
        double[] result = { 0.0, 0.0, 0.0 };

        // euler angles transformation - generated automatically with maple - inertial.ms
        double cpsi = Math.cos(psi);
        double spsi = Math.sin(psi);
        double ctheta = Math.cos(theta);
        double stheta = Math.sin(theta);
        double cphi = Math.cos(phi);
        double sphi = Math.sin(phi);
        double t3 = y * cpsi;
        double t4 = stheta * sphi;
        double t6 = y * spsi;
        double t8 = z * cpsi;
        double t9 = stheta * cphi;
        double t11 = z * spsi;

        result[0] = cpsi * ctheta * x + t3 * t4 - t6 * cphi + t8 * t9 + t11 * sphi;
        result[1] = spsi * ctheta * x + t6 * t4 + t3 * cphi + t11 * t9 - t8 * sphi;
        result[2] = -stheta * x + ctheta * sphi * y + ctheta * cphi * z;

        return result;
    }

    /**
     * Changes a 3D point in the inertial reference frame to the vehicle body frame.
     * 
     * @param (x,y,z) are the point coodinates and (phi,theta,psi) represent the orientation on each axis from one reference frame to the other. Examples: If
     *        (-1,1,1) is the point in one inertial frame and (0,0,pi/2) is the orientation of the body frame with respect to the the body frame, the same point
     *        in the inertial frame becomes (1,1,1)
     * 
     * @return Is a DoubleArray in the form of {x, y, z} which is the point in the body coordinates
     */
    public static double[] inertialFrameToBodyFrame(double x, double y, double z, double phi, double theta, double psi) {
        double[] result = { 0.0, 0.0, 0.0 };

        // euler to body velocities transformation - generated automaticly with maple - inertial.ms
        double t1 = Math.cos(psi);
        double t2 = Math.cos(theta);
        double t5 = Math.sin(psi);
        double t8 = Math.sin(theta);
        result[0] = t1 * t2 * x + t5 * t2 * y - t8 * z;
        double t10 = x * t1;
        double t11 = Math.sin(phi);
        double t12 = t8 * t11;
        double t14 = x * t5;
        double t15 = Math.cos(phi);
        double t17 = y * t5;
        double t19 = y * t1;
        result[1] = t10 * t12 - t14 * t15 + t17 * t12 + t19 * t15 + t11 * t2 * z;
        double t23 = t8 * t15;
        result[2] = t10 * t23 + t14 * t11 + t17 * t23 - t19 * t11 + t15 * t2 * z;

        return result;
    }

    /**
     * This method transforms spherical coordinates to cartesian coordinates.
     * 
     * @param r Distance
     * @param theta Azimuth (\u00B0)
     * @param phi Zenith (\u00B0)
     * @return Array with x,y,z positions
     */
    public static double[] sphericalToCartesianCoordinates(double r, double theta, double phi) {
        double[] cartesian = new double[3];

        if (r == 0) {
            cartesian[0] = 0;
            cartesian[1] = 0;
            cartesian[2] = 0;
            return cartesian;
        }

        // converts degrees to rad
        theta = Math.toRadians(theta);
        phi = Math.toRadians(phi);

        double x = r * Math.cos(theta) * Math.sin(phi);
        double y = r * Math.sin(theta) * Math.sin(phi);
        double z = r * Math.cos(phi);

        cartesian[0] = x;
        cartesian[1] = y;
        cartesian[2] = z;

        return cartesian;
    }

    /**
     * This method transforms cylindrical coordinates to cartesian coordinates.
     * 
     * @param r Distance
     * @param theta Azimuth (\u00B0)
     * @param h Height
     * @return Array with x,y,z positions
     */
    public static double[] cylindricalToCartesianCoordinates(double r, double theta, double h) {
        double[] cartesian = new double[3];

        if (r == 0) {
            cartesian[0] = 0;
            cartesian[1] = 0;
            cartesian[2] = h;
            return cartesian;
        }

        // converts degrees to rad
        theta = Math.toRadians(theta);

        double x = r * Math.cos(theta);
        double y = r * Math.sin(theta);
        double z = h;

        cartesian[0] = x;
        cartesian[1] = y;
        cartesian[2] = z;

        return cartesian;
    }

    /**
     * This metho transforms cartesian coordinates to sherical coordinates
     * 
     * @param x
     * @param y
     * @param z
     * @return Array with r, theta (rad) and phi (rad) (distance, azimuth, zenith)
     */
    public static double[] cartesianToSphericalCoordinates(double x, double y, double z) {
        double[] polar = new double[3];
        double r = Math.sqrt(x * x + y * y + z * z);
        if (r >= 1e-6) {
            double theta = 0;
            if (Math.abs(x) > 1e-6) {
                if (x > 0)
                    theta = Math.atan(y / x);
                else
                    theta = Math.PI + Math.atan(y / x);
            }
            else {
                if (y == 0) {
                    theta = 0;
                }
                else if (y > 0) {
                    theta = Math.PI / 2;
                }
                else if (y < 0) {
                    theta = -Math.PI / 2;
                }
            }
            double phi = Math.acos(z / r);

            polar[0] = r;
            polar[1] = theta;
            polar[2] = phi;
        }
        else if (r < 1e-6) {
            polar[0] = 0;
            polar[1] = 0;
            polar[2] = 0;
        }
        return polar;
    }

    /**
     * This metho transforms cartesian coordinates to sherical coordinates
     * 
     * @param x
     * @param y
     * @param z
     * @return Array with r, theta (rad) and h (distance, azimuth, height)
     */
    public static double[] cartesianToCylindricalCoordinates(double x, double y, double z) {
        double[] cyl = new double[3];
        double r = Math.sqrt(x * x + y * y);
        double h = z;
        if (r >= 1e-6) {
            double theta = 0;
            if (Math.abs(x) > 1e-6) {
                if (x > 0)
                    theta = Math.atan(y / x);
                else
                    theta = Math.PI + Math.atan(y / x);
            }
            else {
                if (y == 0) {
                    theta = 0;
                }
                else if (y > 0) {
                    theta = Math.PI / 2;
                }
                else if (y < 0) {
                    theta = -Math.PI / 2;
                }
            }

            cyl[0] = r;
            cyl[1] = theta;
            cyl[2] = h;
        }
        else if (r < 1e-6) {
            cyl[0] = 0;
            cyl[1] = 0;
            cyl[2] = h;
        }
        return cyl;
    }

    /**
     * This method transforms spherical coordinates to cylindrical coordinates.
     * 
     * @param r Distance
     * @param theta Azimuth (\u00B0)
     * @param phi Zenith (\u00B0)
     * @return Array
     */
    public static double[] sphericalToCylindricalCoordinates(double r, double theta, double phi) {
        double[] rec = sphericalToCartesianCoordinates(r, theta, phi);
        double[] cyl = cartesianToCylindricalCoordinates(rec[0], rec[1], rec[2]);
        return cyl;
    }

    /**
     * This method transforms cylindrical coordinates to spherical coordinates.
     * 
     * @param r Distance
     * @param theta Azimuth (\u00B0)
     * @param phi Zenith (\u00B0)
     * @return Array
     */
    public static double[] cylindricalToShericalCoordinates(double r, double theta, double h) {
        double[] rec = cylindricalToCartesianCoordinates(r, theta, h);
        double[] sph = cartesianToSphericalCoordinates(rec[0], rec[1], rec[2]);
        return sph;
    }

    /**
     * @param r Distance
     * @param theta Azimuth (\u00B0)
     * @param phi Zenith (\u00B0)
     * @param x
     * @param y
     * @param z
     * @return r, theta (rads), h
     */
    public static double[] addSphericalToCartesianOffsetsAndGetAsCylindrical(double r, double theta, double phi, double x, double y, double z) {
        // double[] sph = new double[] {r, theta, phi};
        // double[] rec = new double[] {x, y, z};
        double[] sphRec = sphericalToCartesianCoordinates(r, theta, phi);
        double[] recSum = new double[] { x + sphRec[0], y + sphRec[1], z + sphRec[2] };
        double[] result = cartesianToCylindricalCoordinates(recSum[0], recSum[1], recSum[2]);
        return result;
    }

    private static double[] latLonDepthToGeocentricXYZ(double latitude, double longitude, double depth) {

        final double a = 6378137.0; // (metros do semi-eixo maior )
        final double b = 6356752.3142; // (metros do semi-eixo menor)

        double Hi = -depth;
        double Lat = Math.toRadians(latitude);
        double Lon = Math.toRadians(longitude);

        double CFi = Math.cos(Lat);
        double SFi = Math.sin(Lat);

        double N = a * a / Math.sqrt(a * a * CFi * CFi + b * b * SFi * SFi);

        double xyz[] = new double[3];

        xyz[0] = (N + Hi) * CFi * Math.cos(Lon);
        xyz[1] = (N + Hi) * CFi * Math.sin(Lon);
        xyz[2] = (b * b / a / a * N + Hi) * SFi;

        return xyz;
    }

    /**
     * Gently taken from openmap UTMPoint class
     * 
     * @param lat A latitude in decimal degrees
     * @param lon A longitude in decimal degrees
     * @return An array a[2] with a[0] = northingMeters and a[1] = eastingMeters
     */
    protected double[] latLonToUTM(double lat, double lon) {
        double WGS84_radius = 6378137.0d;
        double WGS84_eccSqared = 0.00669438d;
        double a = WGS84_radius;
        double eccSquared = WGS84_eccSqared;
        double k0 = 0.9996;

        double LongOrigin;
        double eccPrimeSquared;
        double N, T, C, A, M;

        double LatRad = Math.toRadians(lat);
        double LongRad = Math.toRadians(lon);
        double LongOriginRad;
        int ZoneNumber;
        ZoneNumber = (int) ((lon + 180) / 6) + 1;

        // Make sure the longitude 180.00 is in Zone 60
        if (lon == 180) {
            ZoneNumber = 60;
        }

        // Special zone for Norway
        if (lat >= 56.0f && lat < 64.0f && lon >= 3.0f && lon < 12.0f) {
            ZoneNumber = 32;
        }

        // Special zones for Svalbard
        if (lat >= 72.0f && lat < 84.0f) {
            if (lon >= 0.0f && lon < 9.0f)
                ZoneNumber = 31;
            else if (lon >= 9.0f && lon < 21.0f)
                ZoneNumber = 33;
            else if (lon >= 21.0f && lon < 33.0f)
                ZoneNumber = 35;
            else if (lon >= 33.0f && lon < 42.0f)
                ZoneNumber = 37;
        }
        LongOrigin = (ZoneNumber - 1) * 6 - 180 + 3; // +3 puts origin
        // in middle of
        // zone
        LongOriginRad = Math.toRadians(LongOrigin);

        eccPrimeSquared = (eccSquared) / (1 - eccSquared);

        N = a / Math.sqrt(1 - eccSquared * Math.sin(LatRad) * Math.sin(LatRad));
        T = Math.tan(LatRad) * Math.tan(LatRad);
        C = eccPrimeSquared * Math.cos(LatRad) * Math.cos(LatRad);
        A = Math.cos(LatRad) * (LongRad - LongOriginRad);

        M = a
                * ((1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256) * LatRad
                        - (3 * eccSquared / 8 + 3 * eccSquared * eccSquared / 32 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(2 * LatRad)
                        + (15 * eccSquared * eccSquared / 256 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(4 * LatRad) - (35 * eccSquared
                        * eccSquared * eccSquared / 3072)
                        * Math.sin(6 * LatRad));

        double UTMEasting = (k0 * N * (A + (1 - T + C) * A * A * A / 6.0d + (5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSquared) * A * A * A * A * A / 120.0d) + 500000.0d);

        double UTMNorthing = (float) (k0 * (M + N
                * Math.tan(LatRad)
                * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24.0d + (61 - 58 * T + T * T + 600 * C - 330 * eccPrimeSquared) * A * A * A * A
                        * A * A / 720.0d)));
        if (lat < 0.0f) {
            UTMNorthing += 10000000.0d; // 10000000 meter offset for
            // southern hemisphere
        }

        return new double[] { UTMNorthing * 1000.0, UTMEasting * 1000.0 };
    }
    

    public static String latitudeAsString(double latitude) {
        return latitudeAsString(latitude, true);
    }

    public static String longitudeAsString(double longitude) {
        return longitudeAsString(longitude, true);
    }

    public static String latitudeAsString(double latitude, boolean minutesOnly) {
        return latitudeAsString(latitude, minutesOnly, -1);
    }
    
    public static String latitudeAsString(double latitude, boolean minutesOnly, int maxDecimalHouses) {
        if (!minutesOnly)
            return dmsToLatLonString(decimalDegreesToDMS(latitude), true, maxDecimalHouses);
        else
            return dmToLatLonString(decimalDegreesToDM(latitude), true, maxDecimalHouses);
    }

    public static String longitudeAsString(double longitude, boolean minutesOnly) {
        return longitudeAsString(longitude, minutesOnly, -1);
    }

    public static String longitudeAsString(double longitude, boolean minutesOnly, int maxDecimalHouses) {
        if (!minutesOnly)
            return dmsToLatLonString(decimalDegreesToDMS(longitude), false, maxDecimalHouses);
        else
            return dmToLatLonString(decimalDegreesToDM(longitude), false, maxDecimalHouses);
    }
    // ---------------------------------------------------------------------------------------------
    /**
     * Copied from Dune
     * 
     * @param loc
     * @return
     */
    private static double[] toECEF(double latDegrees, double lonDegrees, double depth) {

        double lld[] = {latDegrees, lonDegrees, depth};

        lld[0] = Math.toRadians(lld[0]);
        lld[1] = Math.toRadians(lld[1]);

        double cos_lat = Math.cos(lld[0]);
        double sin_lat = Math.sin(lld[0]);
        double cos_lon = Math.cos(lld[1]);
        double sin_lon = Math.sin(lld[1]);
        double rn = c_wgs84_a / Math.sqrt(1.0 - c_wgs84_e2 * sin_lat * sin_lat);
        double[] ned = new double[3];
        ned[0] = (rn - lld[2]) * cos_lat * cos_lon;
        ned[1] = (rn - lld[2]) * cos_lat * sin_lon;
        ned[2] = (((1.0 - c_wgs84_e2) * rn) - lld[2]) * sin_lat;

        return ned;
    }

    /**
     * Copied from Dune
     * 
     * @param lat
     * @return
     */
    private static double n_rad(double lat) {
        double lat_sin = Math.sin(lat);
        return c_wgs84_a / Math.sqrt(1 - c_wgs84_e2 * (lat_sin * lat_sin));
    }

    /**
     * Copied from Dune
     * 
     * @param x
     * @param y
     * @param z
     * @return
     */
    private static double[] toGeodetic(double x, double y, double z) {
        double[] lld = new double[3];

        double p = Math.sqrt(x * x + y * y);
        lld[1] = Math.atan2(y, x);
        lld[0] = Math.atan2(z / p, 0.01);
        double n = n_rad(lld[0]);
        lld[2] = p / Math.cos(lld[0]) - n;
        double old_hae = -1e-9;
        double num = z / p;

        while (Math.abs(lld[2] - old_hae) > 1e-4) {
            old_hae = lld[2];
            double den = 1 - c_wgs84_e2 * n / (n + lld[2]);
            lld[0] = Math.atan2(num, den);
            n = n_rad(lld[0]);
            lld[2] = p / Math.cos(lld[0]) - n;
        }

        lld[0] = Math.toDegrees(lld[0]);
        lld[1] = Math.toDegrees(lld[1]);

        return lld;
    }

    public static double[] WGS84displacement(LocationType loc1, LocationType loc2) {
        LocationType locTmp1 = loc1.getNewAbsoluteLatLonDepth();
        LocationType locTmp2 = loc2.getNewAbsoluteLatLonDepth();
        return WGS84displacement(locTmp1.getLatitudeDegs(), locTmp1.getLongitudeDegs(), locTmp1.getDepth(),
                locTmp2.getLatitudeDegs(), locTmp2.getLongitudeDegs(), locTmp2.getDepth());
    }
    
    /**
     * Copied from Dune
     * 
     * @param loc1
     * @param loc2
     * @return
     */
    public static double[] WGS84displacement(double latDegrees1, double lonDegrees1, double depth1,
            double latDegrees2, double lonDegrees2, double depth2) {

        double cs1[];
        double cs2[];

        cs1 = toECEF(latDegrees1, lonDegrees1, depth1);
        cs2 = toECEF(latDegrees2, lonDegrees2, depth2);

        double ox = cs2[0] - cs1[0];
        double oy = cs2[1] - cs1[1];
        double oz = cs2[2] - cs1[2];
        double[] lld1 = { latDegrees1, lonDegrees1, depth1 };

        double slat = Math.sin(Math.toRadians(lld1[0]));
        double clat = Math.cos(Math.toRadians(lld1[0]));
        double slon = Math.sin(Math.toRadians(lld1[1]));
        double clon = Math.cos(Math.toRadians(lld1[1]));

        double[] ret = new double[3];

        ret[0] = -slat * clon * ox - slat * slon * oy + clat * oz; // North
        ret[1] = -slon * ox + clon * oy; // East
        ret[2] = depth1 - depth2;

        return ret;
    }

    /**
     * Copied from Dune
     * 
     * @param loc
     * @param n
     * @param e
     * @param d
     */
    public static double[] WGS84displace(double latDegrees, double lonDegrees, double depth, double n, double e, double d) {
        // Convert reference to ECEF coordinates
        double xyz[] = toECEF(latDegrees, lonDegrees, depth);
        double lld[] = {latDegrees, lonDegrees, depth };
        // Compute Geocentric latitude
        double phi = Math.atan2(xyz[2], Math.sqrt(xyz[0] * xyz[0] + xyz[1] * xyz[1]));

        // Compute all needed sine and cosine terms for conversion.
        double slon = Math.sin(Math.toRadians(lld[1]));
        double clon = Math.cos(Math.toRadians(lld[1]));
        double sphi = Math.sin(phi);
        double cphi = Math.cos(phi);

        // Obtain ECEF coordinates of displaced point
        // Note: some signs from standard ENU formula
        // are inverted - we are working with NED (= END) coordinates
        xyz[0] += -slon * e - clon * sphi * n - clon * cphi * d;
        xyz[1] += clon * e - slon * sphi * n - slon * cphi * d;
        xyz[2] += cphi * n - sphi * d;

        // Convert back to WGS-84 coordinates
        lld = toGeodetic(xyz[0], xyz[1], xyz[2]);
        
        if (d != 0d)
            lld[2] = depth + d;
        else
            lld[2] = depth;
        return lld;
    }

    /**
     * Copied from Dune
     * Get North-East bearing and range between two latitude/longitude coordinates.
     */
    public static double[] getNEBearingDegreesAndRange(LocationType loc1, LocationType loc2) {
        double bearing = 0, range = 0;
        double n, e;
        double[] ne = WGS84displacement(loc1, loc2);
        n = ne[0];
        e = ne[1];
        bearing = Math.atan2(e, n);
        range = Math.sqrt(n * n + e * e);
        return new double[] { Math.toDegrees(bearing), range };
    }

}