# GNUstep makefile

-include ../../config.make
include $(GNUSTEP_MAKEFILES)/common.make
include ../Version
include ./Version

BUNDLE_NAME        = STXSaxDriver
BUNDLE_EXTENSION   = .sax
BUNDLE_INSTALL_DIR = $(GNUSTEP_INSTALLATION_DIR)/Library/SaxDrivers-$(SOPE_MAJOR_VERSION).$(SOPE_MINOR_VERSION)/

STXSaxDriver_PCH_FILE = common.h

STXSaxDriver_OBJC_FILES += \
	STXSaxDriver.m	\
	StructuredTextBodyElement+SAX.m

STXSaxDriver_SUBPROJECTS += \
	ExtraSTX \
	Model

STXSaxDriver_RESOURCE_FILES += Version

-include GNUmakefile.preamble
include $(GNUSTEP_MAKEFILES)/bundle.make
-include GNUmakefile.postamble
-include fhs.make
