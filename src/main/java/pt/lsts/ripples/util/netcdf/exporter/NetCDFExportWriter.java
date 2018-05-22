/*
 * Copyright (c) 2018 Universidade do Porto - Faculdade de Engenharia
 * Laboratório de Sistemas e Tecnologia Subaquática (LSTS)
 * All rights reserved.
 * Rua Dr. Roberto Frias s/n, sala I203, 4200-465 Porto, Portugal
 *
 * Author: pdias
 * 17/05/2018
 */
package pt.lsts.ripples.util.netcdf.exporter;

import java.io.File;
import java.io.IOException;

import ucar.nc2.NetcdfFileWriter;

/**
 * @author pdias
 *
 */
public class NetCDFExportWriter {

    public static NetcdfFileWriter createWriter(File location) throws IOException {
        return createWriter(location.getAbsolutePath());
    }

    public static NetcdfFileWriter createWriter(String location) throws IOException {
        return NetcdfFileWriter.createNew(NetcdfFileWriter.Version.netcdf3, location, null);
    }
}
