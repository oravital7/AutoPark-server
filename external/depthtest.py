from __future__ import absolute_import, division, print_function

import os
import numpy as np
import PIL.Image as pil
import matplotlib.pyplot as plt
import sys
import torch
from torchvision import transforms

import networks

ROOT_DIR = os.path.join("external", "logs")

encoder_path = os.path.join(ROOT_DIR, "encoder.pth")
depth_decoder_path = os.path.join(ROOT_DIR, "depth.pth")

# LOADING PRETRAINED MODEL
encoder = networks.ResnetEncoder(18, False)
depth_decoder = networks.DepthDecoder(num_ch_enc=encoder.num_ch_enc, scales=range(4))

loaded_dict_enc = torch.load(encoder_path, map_location='cpu')
filtered_dict_enc = {k: v for k, v in loaded_dict_enc.items() if k in encoder.state_dict()}
encoder.load_state_dict(filtered_dict_enc)

loaded_dict = torch.load(depth_decoder_path, map_location='cpu')
depth_decoder.load_state_dict(loaded_dict)

encoder.eval()
depth_decoder.eval()

image_path = sys.argv[1]
centerPoint = (int(float(sys.argv[2])), int(float(sys.argv[3])))

input_image = pil.open(image_path).convert('RGB')
original_width, original_height = input_image.size

feed_height = loaded_dict_enc['height']
feed_width = loaded_dict_enc['width']
input_image_resized = input_image.resize((feed_width, feed_height), pil.LANCZOS)

input_image_pytorch = transforms.ToTensor()(input_image_resized).unsqueeze(0)

with torch.no_grad():
    features = encoder(input_image_pytorch)
    outputs = depth_decoder(features)

disp = outputs[("disp", 0)]

disp_resized = torch.nn.functional.interpolate(disp,
                                               (original_height, original_width), mode="bilinear", align_corners=False)

# Saving colormapped depth image
disp_resized_np = disp_resized.squeeze().cpu().numpy()
vmax = np.percentile(disp_resized_np, 95)

if centerPoint[0] < original_width and centerPoint[1] < original_height:
    print(disp_resized_np[centerPoint[0], centerPoint[1]])
else:
    print(-1)

# print(vmax)
# print(original_width, original_height)
# print(disp_resized_np.shape)

# plt.figure(figsize=(10, 10))
# plt.subplot(211)
# plt.imshow(input_image)
# plt.title("Input", fontsize=22)
# plt.axis('off')
#

# plt.figure(figsize=(50, 30))
plt.imsave("output-test.png", disp_resized_np, cmap='magma', vmax=vmax)

# plt.imshow(disp_resized_np, cmap='magma', vmax=vmax)
# plt.axis('off')
# plt.savefig("output-test.png")
# plt.title("Disparity prediction", fontsize=22)
